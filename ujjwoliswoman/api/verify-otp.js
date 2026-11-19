/**
 * BPG Academy — Serverless OTP Verifier & Account Provisioner (api/verify-otp.js)
 * Validates 6-digit OTP, enforces canonical Gmail uniqueness on signup, starts new
 * students on Free plan, or completes password reset for existing accounts.
 */

const crypto = require('crypto');
const {
    OTP_SECRET,
    canonicalizeEmail,
    gradeToClassKey,
    normalizeGradeName,
    issueStudentSessionToken,
    readRoster,
    writeRoster
} = require('./access-control');

if (!global.__BPG_OTP_STORE__) {
    global.__BPG_OTP_STORE__ = new Map();
}

function verifySignedOtpToken(email, otp, otpToken, mode) {
    if (!otpToken) return { valid: false, reason: 'Missing verification token.' };
    try {
        const decoded = JSON.parse(Buffer.from(otpToken, 'base64url').toString('utf8'));
        const canonical = canonicalizeEmail(email);
        const tokenCanonical = decoded.canonicalEmail || canonicalizeEmail(decoded.email);
        const tokenMode = decoded.mode || 'signup';

        if (!decoded || tokenCanonical !== canonical || tokenMode !== mode) {
            return { valid: false, reason: 'Email mismatch for verification token.' };
        }
        if (Date.now() > Number(decoded.expiresAt)) {
            return { valid: false, reason: 'Verification code has expired. Please request a new OTP.' };
        }
        const expectedPayload = `${canonical}|${tokenMode}|${String(otp).trim()}|${decoded.expiresAt}`;
        const expectedSig = crypto
            .createHmac('sha256', OTP_SECRET)
            .update(expectedPayload)
            .digest('hex');

        const expectedBuf = Buffer.from(expectedSig, 'hex');
        const actualBuf = Buffer.from(String(decoded.signature || ''), 'hex');
        if (expectedBuf.length === 0 || expectedBuf.length !== actualBuf.length) {
            return { valid: false, reason: 'Invalid 6-digit verification code.' };
        }
        const isMatch = crypto.timingSafeEqual(expectedBuf, actualBuf);
        return isMatch
            ? { valid: true }
            : { valid: false, reason: 'Invalid 6-digit verification code.' };
    } catch (e) {
        return { valid: false, reason: 'Invalid verification code or token format.' };
    }
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const email = String(body.email || '').trim().toLowerCase();
        const canonical = canonicalizeEmail(email);
        const otp = String(body.otp || '').trim();
        const otpToken = String(body.otpToken || '').trim();
        const name = String(body.name || 'Student').trim();
        const grade = normalizeGradeName(body.grade || 'Class 12');
        const mode = String(body.mode || 'signup').toLowerCase() === 'reset' ? 'reset' : 'signup';
        const newPassword = String(body.newPassword || body.password || '').trim();

        if (!email || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                ok: false,
                error: 'Please enter a valid 6-digit numeric verification code.'
            });
        }

        const storeKey = `${canonical}|${mode}`;
        const memRecord = global.__BPG_OTP_STORE__.get(storeKey);
        let verified = false;

        if (memRecord) {
            if (Date.now() > memRecord.expiresAt) {
                global.__BPG_OTP_STORE__.delete(storeKey);
                return res.status(400).json({ ok: false, error: 'OTP has expired. Please request a new code.' });
            }
            if ((memRecord.attempts || 0) >= 5) {
                global.__BPG_OTP_STORE__.delete(storeKey);
                return res.status(429).json({ ok: false, error: 'Too many incorrect OTP attempts. Please request a new code.' });
            }
            if (memRecord.otp === otp) {
                verified = true;
                global.__BPG_OTP_STORE__.delete(storeKey);
            } else {
                memRecord.attempts = (memRecord.attempts || 0) + 1;
            }
        }

        if (!verified && otpToken) {
            const check = verifySignedOtpToken(email, otp, otpToken, mode);
            if (!check.valid) {
                return res.status(401).json({ ok: false, error: check.reason });
            }
            verified = true;
        }

        if (!verified) {
            return res.status(401).json({
                ok: false,
                error: 'Incorrect 6-digit OTP code. Please check and try again.'
            });
        }

        const roster = readRoster();
        const existingIdx = roster.accounts.findIndex(a => a.canonicalEmail === canonical);

        if (mode === 'reset') {
            if (existingIdx === -1) {
                return res.status(404).json({ ok: false, code: 'ACCOUNT_NOT_FOUND', error: 'Account not found.' });
            }
            if (newPassword) {
                roster.accounts[existingIdx].passkey = newPassword;
            }
            writeRoster(roster);
            const acc = roster.accounts[existingIdx];
            const sessionToken = issueStudentSessionToken(acc);
            const { passkey, ...safeUser } = acc;
            return res.status(200).json({
                ok: true,
                verified: true,
                mode: 'reset',
                sessionToken,
                user: { ...safeUser, verified: true },
                message: 'Password updated! Signed in to your workspace.'
            });
        }

        // SIGNUP: Re-enforce canonical Gmail uniqueness right before DB commit
        if (existingIdx !== -1) {
            return res.status(409).json({
                ok: false,
                code: 'EMAIL_EXISTS',
                existingEmail: roster.accounts[existingIdx].email,
                error: 'An account already exists for this Gmail address. Please sign in or reset your password.'
            });
        }

        const newAccount = {
            name,
            email,
            canonicalEmail: canonical,
            grade,
            classKey: gradeToClassKey(grade),
            plan: 'free',
            planExplicitlySet: false,
            legacyAccess: false,
            passkey: newPassword || 'bpgstudent',
            joinedAt: new Date().toISOString().split('T')[0]
        };
        roster.accounts.unshift(newAccount);
        writeRoster(roster);

        const sessionToken = issueStudentSessionToken(newAccount);
        const { passkey, ...safeUser } = newAccount;

        return res.status(200).json({
            ok: true,
            verified: true,
            mode: 'signup',
            sessionToken,
            user: { ...safeUser, verified: true, verifiedAt: new Date().toISOString() },
            message: 'Account verified! Starting on the Free plan.'
        });
    } catch (err) {
        console.error('[BPG Verify OTP Error]:', err);
        return res.status(500).json({
            ok: false,
            error: 'Verification failed. Please try again.'
        });
    }
};
