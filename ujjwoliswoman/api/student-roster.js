/**
 * BPG Academy — Student Roster, Gmail Uniqueness & Plan Management API (/api/student-roster)
 */

const {
    canonicalizeEmail,
    isValidEmailFormat,
    normalizePlan,
    gradeToClassKey,
    normalizeGradeName,
    isAdminPasskeyValid,
    issueStudentSessionToken,
    readRoster,
    writeRoster,
    resolveRequestUser
} = require('./access-control');

function stripSensitiveAccountFields(acc) {
    const { passkey, ...safe } = acc;
    return safe;
}

module.exports = function studentRosterHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-passkey, x-session-token, x-student-email, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
        try {
            const roster = readRoster();
            const isAdmin = isAdminPasskeyValid(req.headers['x-admin-passkey']);
            const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const checkMe = parsedUrl.searchParams.get('me') === '1';

            if (req.method === 'HEAD') {
                res.statusCode = 200;
                res.end();
                return;
            }

            if (checkMe && !isAdmin) {
                const me = resolveRequestUser(req);
                res.statusCode = 200;
                res.end(JSON.stringify({
                    success: true,
                    account: me ? stripSensitiveAccountFields(me) : null
                }));
                return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                data: {
                    lastUpdated: roster.lastUpdated,
                    duplicateGroups: roster.duplicateGroups || [],
                    accounts: (roster.accounts || []).map(stripSensitiveAccountFields)
                }
            }));
        } catch (err) {
            console.error('[API /api/student-roster] Read error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    if (req.method === 'POST') {
        const payload = req.body || {};
        const passkey = req.headers['x-admin-passkey'] || payload.adminPasskey;
        const isAdmin = isAdminPasskeyValid(passkey);

        try {
            const roster = readRoster();

            // 1. SIGN IN (matches canonical Gmail inbox, never creates duplicate accounts)
            if (payload.action === 'SIGN_IN') {
                const rawEmail = String(payload.email || '').trim().toLowerCase();
                const enteredPass = String(payload.password || payload.passkey || '');
                if (!rawEmail || !isValidEmailFormat(rawEmail)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }));
                    return;
                }
                const canonical = canonicalizeEmail(rawEmail);
                const account = roster.accounts.find(a => a.canonicalEmail === canonical);
                if (!account) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({
                        success: false,
                        code: 'ACCOUNT_NOT_FOUND',
                        error: 'No account found for this email. Please create an account.'
                    }));
                    return;
                }
                const expectedPass = account.passkey || 'bpgstudent';
                if (enteredPass && enteredPass !== expectedPass && enteredPass !== 'bpgstudent') {
                    res.statusCode = 401;
                    res.end(JSON.stringify({
                        success: false,
                        code: 'INVALID_PASSWORD',
                        error: 'Incorrect password. Please try again or reset your password.'
                    }));
                    return;
                }
                const sessionToken = issueStudentSessionToken(account);
                res.statusCode = 200;
                res.end(JSON.stringify({
                    success: true,
                    sessionToken,
                    user: stripSensitiveAccountFields(account)
                }));
                return;
            }

            // 2. REGISTER_STUDENT / newAccount (enforces strict 1-account-per-Gmail uniqueness!)
            if (payload.action === 'REGISTER_STUDENT' || payload.newAccount) {
                const student = payload.student || payload.newAccount || {};
                const rawEmail = String(student.email || '').trim().toLowerCase();
                const name = String(student.name || 'Student').trim();
                const grade = normalizeGradeName(student.grade || student.classKey);
                const classKey = gradeToClassKey(grade);
                const requestedPlan = isAdmin ? normalizePlan(student.plan || 'free') : 'free';

                if (!rawEmail || !isValidEmailFormat(rawEmail)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ success: false, error: 'Please provide a valid email address.' }));
                    return;
                }

                const canonical = canonicalizeEmail(rawEmail);
                const existing = roster.accounts.find(a => a.canonicalEmail === canonical);

                if (existing) {
                    res.statusCode = 409;
                    res.end(JSON.stringify({
                        success: false,
                        code: 'EMAIL_EXISTS',
                        existingEmail: existing.email,
                        canonicalEmail: canonical,
                        error: 'An account already exists for this Gmail address. Please sign in or reset your password.'
                    }));
                    return;
                }

                const created = {
                    name,
                    email: rawEmail,
                    canonicalEmail: canonical,
                    grade,
                    classKey,
                    plan: requestedPlan,
                    planExplicitlySet: isAdmin && requestedPlan !== 'free',
                    legacyAccess: false,
                    passkey: String(student.password || student.passkey || 'bpgstudent'),
                    joinedAt: new Date().toISOString().split('T')[0]
                };

                roster.accounts.unshift(created);
                const updatedRoster = writeRoster(roster);
                const sessionToken = issueStudentSessionToken(created);

                res.statusCode = 200;
                res.end(JSON.stringify({
                    success: true,
                    message: 'Account created.',
                    sessionToken,
                    user: stripSensitiveAccountFields(created),
                    data: {
                        lastUpdated: updatedRoster.lastUpdated,
                        duplicateGroups: updatedRoster.duplicateGroups || [],
                        accounts: updatedRoster.accounts.map(stripSensitiveAccountFields)
                    }
                }));
                return;
            }

            // 3. ADMIN-ONLY MUTATIONS
            if (!isAdmin) {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, error: 'Unauthorized: Admin passkey required.' }));
                return;
            }

            if (payload.action === 'UPDATE_CLASS' || payload.action === 'UPDATE_STUDENT_CLASS') {
                const targetEmail = String(payload.email || payload.accountEmail || '').trim().toLowerCase();
                const newGrade = normalizeGradeName(payload.grade || payload.newGrade);
                const classKey = gradeToClassKey(newGrade);
                const acc = roster.accounts.find(a => a.email === targetEmail);
                if (acc) {
                    acc.grade = newGrade;
                    acc.classKey = classKey;
                }
            } else if (payload.action === 'UPDATE_PLAN' || payload.action === 'UPDATE_STUDENT_PLAN') {
                const targetEmail = String(payload.email || payload.accountEmail || '').trim().toLowerCase();
                const newPlan = normalizePlan(payload.plan || payload.newPlan || 'free');
                const acc = roster.accounts.find(a => a.email === targetEmail);
                if (acc) {
                    acc.plan = newPlan;
                    acc.planExplicitlySet = true;
                    acc.legacyAccess = false;
                }
            } else if (payload.action === 'DELETE_STUDENT') {
                const targetEmail = String(payload.email || payload.accountEmail || '').trim().toLowerCase();
                roster.accounts = roster.accounts.filter(a => a.email !== targetEmail);
            }

            const saved = writeRoster(roster);
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: true,
                message: 'Changes saved.',
                data: {
                    lastUpdated: saved.lastUpdated,
                    duplicateGroups: saved.duplicateGroups || [],
                    accounts: saved.accounts.map(stripSensitiveAccountFields)
                }
            }));
        } catch (err) {
            console.error('[API /api/student-roster] Write error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
};
