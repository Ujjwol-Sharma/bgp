/**
 * BPG Academy — Shared Backend Access Control, Gmail Uniqueness & Plans Engine (api/access-control.js)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'academy-state.json');
const LEGACY_CMS_PATH = path.join(ROOT_DIR, 'bpg-cms-data.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'bpg-academy-state.json');
const ROSTER_PATH = path.join(DATA_DIR, 'student-roster.json');
const TMP_ROSTER_PATH = path.join(os.tmpdir(), 'bpg-student-roster.json');

const MASTER_PASSKEY = 'bpg2026';
const OTP_SECRET = process.env.OTP_SECRET || 'bpg-maths-academy-hmac-secret-2026';

const PLAN_RANK = {
    free: 0,
    gold: 1,
    diamond: 2
};

const DEFAULT_SECTION_LOCKS = {
    'class-10': { locked: true, reason: 'Temporarily unavailable' },
    'class-11': { locked: false, reason: '' },
    'class-12': { locked: false, reason: '' },
    'after-12': { locked: true, reason: 'Temporarily unavailable' }
};

const DEFAULT_PLANS_CONFIG = {
    free: {
        id: 'free',
        name: 'Free',
        price: 'Rs. 0',
        period: 'Forever free',
        description: 'Access admin-selected sample questions and PDFs in open sections.'
    },
    gold: {
        id: 'gold',
        name: 'Gold',
        price: 'Rs. 1,499',
        period: 'Per academic year',
        description: 'Includes all Free content plus Gold questions, full answers, and study PDFs.'
    },
    diamond: {
        id: 'diamond',
        name: 'Diamond',
        price: 'Rs. 2,999',
        period: 'Per academic year',
        description: 'Unlocks every question, solution, and PDF across all open sections.'
    }
};

/* --------------------------------------------------------------------------
   1. GMAIL CANONICALIZATION & UNIQUENESS HELPERS
   -------------------------------------------------------------------------- */
function canonicalizeEmail(rawEmail) {
    const cleaned = String(rawEmail || '').trim().toLowerCase();
    const atIdx = cleaned.indexOf('@');
    if (atIdx <= 0) return cleaned;

    let local = cleaned.slice(0, atIdx);
    let domain = cleaned.slice(atIdx + 1);

    if (domain === 'googlemail.com' || domain === 'gmail.com') {
        domain = 'gmail.com';
        const plusIdx = local.indexOf('+');
        if (plusIdx !== -1) {
            local = local.slice(0, plusIdx);
        }
        local = local.replace(/\./g, '');
    }

    return `${local}@${domain}`;
}

function isValidEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function normalizePlan(plan) {
    const p = String(plan || 'free').trim().toLowerCase();
    if (p === 'diamond' || p === 'gold' || p === 'free') return p;
    return 'free';
}

function gradeToClassKey(grade) {
    if (!grade) return 'class-12';
    const g = String(grade).toLowerCase().trim();
    if (g === 'class-10' || g === 'c10' || g.includes('10') || g.includes('see')) return 'class-10';
    if (g === 'class-11' || g === 'c11' || g.includes('11')) return 'class-11';
    if (g === 'after-12' || g === 'entrance' || g.includes('entrance') || g.includes('after') || g.includes('ioe') || g.includes('cee')) return 'after-12';
    if (g === 'class-12' || g === 'c12' || g.includes('12')) return 'class-12';
    return 'class-12';
}

function normalizeGradeName(grade) {
    const key = gradeToClassKey(grade);
    if (key === 'class-10') return 'Class 10';
    if (key === 'class-11') return 'Class 11';
    if (key === 'after-12') return 'After 12 Entrance';
    return 'Class 12';
}

function isAdminPasskeyValid(passkey) {
    return passkey === MASTER_PASSKEY || passkey === 'admin';
}

/* --------------------------------------------------------------------------
   2. SESSION TOKEN SIGNING & VERIFICATION
   -------------------------------------------------------------------------- */
function issueStudentSessionToken(user) {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000;
    const email = String(user.email || '').trim().toLowerCase();
    const payload = {
        email,
        canonicalEmail: canonicalizeEmail(email),
        name: user.name || 'Student',
        grade: normalizeGradeName(user.grade || user.classKey),
        plan: normalizePlan(user.plan),
        verified: true,
        issuedAt,
        expiresAt
    };
    const sig = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
    return Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64url');
}

function verifyStudentSessionToken(token) {
    if (!token) return null;
    try {
        const decoded = JSON.parse(Buffer.from(String(token), 'base64url').toString('utf8'));
        if (!decoded || !decoded.email || !decoded.sig) return null;
        if (decoded.expiresAt && Date.now() > Number(decoded.expiresAt)) return null;
        const { sig, ...payload } = decoded;
        const expected = crypto
            .createHmac('sha256', OTP_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');
        const a = Buffer.from(String(sig), 'hex');
        const b = Buffer.from(expected, 'hex');
        if (a.length === 0 || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            return null;
        }
        return payload;
    } catch (e) {
        return null;
    }
}

/* --------------------------------------------------------------------------
   3. ROSTER STORAGE + DUPLICATE GMAIL FLAGGING
   -------------------------------------------------------------------------- */
function readRoster() {
    if (!fs.existsSync(DATA_DIR)) {
        try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
    }

    let roster = null;
    const candidates = [ROSTER_PATH, TMP_ROSTER_PATH];
    for (const p of candidates) {
        try {
            if (fs.existsSync(p)) {
                roster = JSON.parse(fs.readFileSync(p, 'utf8'));
                break;
            }
        } catch (e) {}
    }

    if (!roster || !Array.isArray(roster.accounts)) {
        roster = {
            lastUpdated: new Date().toISOString(),
            accounts: [
                { name: 'Creative Scholar', email: 'scholar@bpgacademy.edu.np', grade: 'Class 12', classKey: 'class-12', plan: 'free', legacyAccess: true, joinedAt: '2026-11-01' },
                { name: 'Rohan Sharma', email: 'rohan.sharma@gmail.com', grade: 'Class 11', classKey: 'class-11', plan: 'free', legacyAccess: true, joinedAt: '2026-11-03' },
                { name: 'Aayush KC', email: 'aayush.kc@gmail.com', grade: 'Class 10', classKey: 'class-10', plan: 'free', legacyAccess: true, joinedAt: '2026-11-04' },
                { name: 'Prabhat Paudel', email: 'prabhat.entrance@gmail.com', grade: 'After 12 Entrance', classKey: 'after-12', plan: 'free', legacyAccess: true, joinedAt: '2026-11-05' }
            ]
        };
        writeRoster(roster);
    }

    // Normalize every account while preserving existing accounts
    const canonicalCounts = {};
    roster.accounts = roster.accounts.map(acc => {
        const email = String(acc.email || '').trim().toLowerCase();
        const canonicalEmail = canonicalizeEmail(email);
        canonicalCounts[canonicalEmail] = (canonicalCounts[canonicalEmail] || 0) + 1;
        const isExistingLegacy = acc.legacyAccess !== undefined ? Boolean(acc.legacyAccess) : (acc.plan === undefined);
        return {
            ...acc,
            email,
            canonicalEmail,
            grade: normalizeGradeName(acc.grade || acc.classKey),
            classKey: gradeToClassKey(acc.classKey || acc.grade),
            plan: normalizePlan(acc.plan || 'free'),
            legacyAccess: isExistingLegacy,
            passkey: acc.passkey || 'bpgstudent',
            joinedAt: acc.joinedAt || new Date().toISOString().split('T')[0]
        };
    });

    // Flag any pre-existing duplicate Gmail inboxes for admin review
    const duplicateGroups = [];
    const grouped = {};
    roster.accounts.forEach(acc => {
        const isDup = canonicalCounts[acc.canonicalEmail] > 1;
        acc.duplicateFlag = isDup;
        if (isDup) {
            if (!grouped[acc.canonicalEmail]) grouped[acc.canonicalEmail] = [];
            grouped[acc.canonicalEmail].push(acc.email);
        }
    });
    Object.keys(grouped).forEach(ce => {
        duplicateGroups.push({ canonicalEmail: ce, emails: grouped[ce], count: grouped[ce].length });
    });
    roster.duplicateGroups = duplicateGroups;

    return roster;
}

function writeRoster(roster) {
    const clean = {
        lastUpdated: new Date().toISOString(),
        accounts: (roster.accounts || []).map(acc => ({
            name: acc.name || 'Student',
            email: String(acc.email || '').trim().toLowerCase(),
            canonicalEmail: canonicalizeEmail(acc.email),
            grade: normalizeGradeName(acc.grade || acc.classKey),
            classKey: gradeToClassKey(acc.classKey || acc.grade),
            plan: normalizePlan(acc.plan || 'free'),
            planExplicitlySet: Boolean(acc.planExplicitlySet),
            legacyAccess: Boolean(acc.legacyAccess),
            passkey: acc.passkey || 'bpgstudent',
            joinedAt: acc.joinedAt || new Date().toISOString().split('T')[0]
        }))
    };

    const serialized = JSON.stringify(clean, null, 2);
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        const tmp = ROSTER_PATH + '.tmp.' + Date.now();
        fs.writeFileSync(tmp, serialized, 'utf8');
        fs.renameSync(tmp, ROSTER_PATH);
    } catch (e) {}
    try {
        fs.writeFileSync(TMP_ROSTER_PATH, serialized, 'utf8');
    } catch (e) {}
    return readRoster();
}

function findAccountByEmail(email) {
    const canonical = canonicalizeEmail(email);
    const roster = readRoster();
    return roster.accounts.find(a => a.canonicalEmail === canonical) || null;
}

/* --------------------------------------------------------------------------
   4. ACADEMY STATE + SECTION LOCKS + PLANS DEFAULTS & SANITIZATION
   -------------------------------------------------------------------------- */
function ensureAccessModelDefaults(state) {
    if (!state || typeof state !== 'object') return state;

    // 1. Section Locks (Class 10 & Entrance Prep locked by default)
    if (!state.sectionLocks || typeof state.sectionLocks !== 'object') {
        state.sectionLocks = JSON.parse(JSON.stringify(DEFAULT_SECTION_LOCKS));
    } else {
        Object.keys(DEFAULT_SECTION_LOCKS).forEach(key => {
            if (!state.sectionLocks[key] || typeof state.sectionLocks[key] !== 'object') {
                state.sectionLocks[key] = { ...DEFAULT_SECTION_LOCKS[key] };
            } else {
                state.sectionLocks[key].locked = Boolean(state.sectionLocks[key].locked);
                state.sectionLocks[key].reason = state.sectionLocks[key].reason || (state.sectionLocks[key].locked ? 'Temporarily unavailable' : '');
            }
        });
    }

    // 2. Configurable Free / Gold / Diamond Plans
    if (!state.plansConfig || typeof state.plansConfig !== 'object') {
        state.plansConfig = JSON.parse(JSON.stringify(DEFAULT_PLANS_CONFIG));
    } else {
        ['free', 'gold', 'diamond'].forEach(pid => {
            state.plansConfig[pid] = Object.assign(
                {},
                DEFAULT_PLANS_CONFIG[pid],
                state.plansConfig[pid] || {},
                { id: pid }
            );
        });
    }

    // 3. Ensure every topic/question and PDF note has a normalized minPlan
    if (state.portals && typeof state.portals === 'object') {
        Object.keys(state.portals).forEach(classKey => {
            const portal = state.portals[classKey];
            if (!portal) return;

            let topicIdx = 0;
            (portal.units || []).forEach(u => {
                (u.topics || []).forEach(t => {
                    if (!t.minPlan) {
                        t.minPlan = topicIdx === 0 ? 'free' : (topicIdx === 1 ? 'gold' : 'diamond');
                        t.adminAssignedPlan = false;
                    } else {
                        t.minPlan = normalizePlan(t.minPlan);
                    }
                    topicIdx++;
                });
            });

            const notesList = Array.isArray(portal.notes) && portal.notes.length
                ? portal.notes
                : (Array.isArray(portal.notesPdfs) ? portal.notesPdfs : []);

            notesList.forEach((n, idx) => {
                if (!n.id) n.id = `${classKey}-note-${idx + 1}`;
                if (!n.minPlan) {
                    n.minPlan = idx === 0 ? 'free' : (idx === 1 ? 'gold' : 'diamond');
                    n.adminAssignedPlan = false;
                } else {
                    n.minPlan = normalizePlan(n.minPlan);
                }
            });

            portal.notes = notesList;
            portal.notesPdfs = notesList;
        });
    }

    return state;
}

function readAcademyState() {
    if (global.__BPG_ACADEMY_STATE__) {
        return ensureAccessModelDefaults(global.__BPG_ACADEMY_STATE__);
    }
    const candidates = [DB_PATH, TMP_DB_PATH, LEGACY_CMS_PATH];
    let newestState = null;
    let newestTime = 0;

    for (const filePath of candidates) {
        try {
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && parsed.portals) {
                    const t = parsed.lastUpdated ? Date.parse(parsed.lastUpdated) || 0 : 0;
                    if (!newestState || t >= newestTime) {
                        newestState = parsed;
                        newestTime = t;
                    }
                }
            }
        } catch (e) {}
    }

    if (!newestState) {
        newestState = {
            adminPasskey: MASTER_PASSKEY,
            lastUpdated: new Date().toISOString(),
            portals: {
                'class-12': { gradeTitle: 'Grade XII Mathematics', units: [], notes: [] },
                'class-11': { gradeTitle: 'Grade XI Mathematics', units: [], notes: [] },
                'class-10': { gradeTitle: 'Class 10 (SEE Mathematics Foundation)', units: [], notes: [] },
                'after-12': { gradeTitle: 'After 12 Entrance (IOE / CEE / KU)', units: [], notes: [] }
            },
            calendarEvents: []
        };
    }

    ensureAccessModelDefaults(newestState);
    global.__BPG_ACADEMY_STATE__ = newestState;
    return newestState;
}

function resolveRequestUser(req) {
    const token = req.headers['x-session-token'] || '';
    const verified = verifyStudentSessionToken(token);
    if (verified && verified.email) {
        const account = findAccountByEmail(verified.email);
        if (account) return account;
        return {
            email: verified.email,
            canonicalEmail: canonicalizeEmail(verified.email),
            name: verified.name || 'Student',
            grade: verified.grade || 'Class 12',
            classKey: gradeToClassKey(verified.grade),
            plan: normalizePlan(verified.plan || 'free'),
            legacyAccess: false
        };
    }

    const headerEmail = req.headers['x-student-email'] || '';
    if (headerEmail) {
        const account = findAccountByEmail(headerEmail);
        if (account) return account;
    }

    return null;
}

function evaluateItemAccess(user, classKey, item, state) {
    const normClass = gradeToClassKey(classKey);
    const lock = state?.sectionLocks?.[normClass] || DEFAULT_SECTION_LOCKS[normClass] || { locked: false };

    // 1. Section locks ALWAYS apply to every plan, including Diamond & legacy
    if (lock.locked) {
        return {
            allowed: false,
            status: 403,
            code: 'SECTION_LOCKED',
            locked: true,
            reason: lock.reason || 'Temporarily unavailable',
            error: lock.reason || 'Temporarily unavailable'
        };
    }

    if (!item) {
        return {
            allowed: false,
            status: 404,
            code: 'NOT_FOUND',
            error: 'Requested content item was not found.'
        };
    }

    const requiredPlan = normalizePlan(item.minPlan || 'free');
    const userPlan = user ? normalizePlan(user.plan || 'free') : 'free';

    // 2. Preserve existing students' legacy access until an admin assigns the item or user plan
    if (user && user.legacyAccess && !user.planExplicitlySet && !item.adminAssignedPlan) {
        return {
            allowed: true,
            status: 200,
            requiredPlan,
            userPlan,
            viaLegacy: true
        };
    }

    // 3. Hierarchical Plan Access: Free < Gold < Diamond
    if (PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan]) {
        return {
            allowed: true,
            status: 200,
            requiredPlan,
            userPlan
        };
    }

    return {
        allowed: false,
        status: 403,
        code: 'PLAN_REQUIRED',
        requiredPlan,
        userPlan,
        error: 'Level up to unlock this content'
    };
}

function sanitizeStateForStudent(rawState, user) {
    const clone = JSON.parse(JSON.stringify(rawState));
    delete clone.adminPasskey;

    if (!clone.portals) return clone;

    Object.keys(clone.portals).forEach(classKey => {
        const portal = clone.portals[classKey];
        const lock = clone.sectionLocks?.[classKey] || { locked: false, reason: '' };

        portal.sectionLocked = Boolean(lock.locked);
        portal.lockReason = lock.locked ? (lock.reason || 'Temporarily unavailable') : '';

        // If section is locked, strip full questions/answers/PDFs for every plan including Diamond
        if (lock.locked) {
            portal.units = [];
            portal.notes = [];
            portal.notesPdfs = [];
            portal.syllabusRows = [];
            return;
        }

        // Open section: redact body/answers of restricted questions & fileUrl of restricted PDFs
        (portal.units || []).forEach(u => {
            (u.topics || []).forEach(t => {
                const check = evaluateItemAccess(user, classKey, t, clone);
                t.minPlan = normalizePlan(t.minPlan || 'free');
                t.restricted = !check.allowed;
                if (!check.allowed) {
                    delete t.overview;
                    delete t.definitions;
                    delete t.derivation;
                    delete t.example;
                    delete t.pitfalls;
                    delete t.content;
                    delete t.diagramUrl;
                }
            });
        });

        const cleanNotes = (portal.notes || []).map(n => {
            const check = evaluateItemAccess(user, classKey, n, clone);
            const noteCopy = { ...n, minPlan: normalizePlan(n.minPlan || 'free'), restricted: !check.allowed };
            if (!check.allowed) {
                delete noteCopy.fileUrl;
                delete noteCopy.url;
            }
            return noteCopy;
        });

        portal.notes = cleanNotes;
        portal.notesPdfs = cleanNotes;
    });

    // Also hide calendar events for locked sections from students
    if (Array.isArray(clone.calendarEvents)) {
        clone.calendarEvents = clone.calendarEvents.filter(ev => {
            if (!ev.portal || ev.portal === 'all') return true;
            const lock = clone.sectionLocks?.[ev.portal];
            return !(lock && lock.locked);
        });
    }

    return clone;
}

module.exports = {
    ROOT_DIR,
    DATA_DIR,
    DB_PATH,
    LEGACY_CMS_PATH,
    TMP_DB_PATH,
    ROSTER_PATH,
    MASTER_PASSKEY,
    OTP_SECRET,
    PLAN_RANK,
    DEFAULT_SECTION_LOCKS,
    DEFAULT_PLANS_CONFIG,
    canonicalizeEmail,
    isValidEmailFormat,
    normalizePlan,
    gradeToClassKey,
    normalizeGradeName,
    isAdminPasskeyValid,
    issueStudentSessionToken,
    verifyStudentSessionToken,
    readRoster,
    writeRoster,
    findAccountByEmail,
    ensureAccessModelDefaults,
    readAcademyState,
    resolveRequestUser,
    evaluateItemAccess,
    sanitizeStateForStudent
};
