/**
 * BPG Academy — Serverless Email OTP Dispatcher (api/send-email-otp.js)
 * Enforces Gmail canonical uniqueness on signup (dots, capitalization, + aliases)
 * and supports password reset OTP dispatch for existing accounts.
 */

const crypto = require('crypto');
const {
    OTP_SECRET,
    canonicalizeEmail,
    isValidEmailFormat,
    findAccountByEmail
} = require('./access-control');

const OTP_TTL_MS = 10 * 60 * 1000;

if (!global.__BPG_OTP_STORE__) {
    global.__BPG_OTP_STORE__ = new Map();
}

function createSignedOtpToken(email, otp, expiresAt, mode) {
    const canonical = canonicalizeEmail(email);
    const payload = `${canonical}|${mode}|${otp}|${expiresAt}`;
    const signature = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(payload)
        .digest('hex');
    return Buffer.from(JSON.stringify({
        email: email.toLowerCase().trim(),
        canonicalEmail: canonical,
        mode,
        expiresAt,
        signature
    })).toString('base64url');
}

function escapeHtmlEmail(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildOtpEmailHtml({ name, email, grade, otp, mode }) {
    const safeName = escapeHtmlEmail(name || 'Student');
    const safeEmail = escapeHtmlEmail(email || '');
    const safeGrade = escapeHtmlEmail(grade || 'Class 12');
    const safeOtp = escapeHtmlEmail(otp || '');
    const title = mode === 'reset' ? 'Reset Your Password' : 'Verify Your Student Account';
    const bodyText = mode === 'reset'
        ? `Use the 6-digit code below to reset your password for <strong>${safeEmail}</strong>.`
        : `Namaste <strong>${safeName}</strong>, use the 6-digit code below to activate your <strong>${safeGrade}</strong> workspace on BPG Academy.`;
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${title}</title></head>
    <body style="margin:0; padding:32px 16px; background-color:#ffffff; font-family:'Inter', sans-serif; color:#111114;">
        <div style="max-width:500px; margin:0 auto; border:1px solid #e6e6eb; border-radius:12px; padding:32px;">
            <h1 style="font-size:22px; margin:0 0 12px;">${title}</h1>
            <p style="font-size:15px; line-height:1.6; color:#52525c; margin:0 0 20px;">${bodyText}</p>
            <div style="background:#f8f8fa; border:1px solid #e6e6eb; border-radius:10px; padding:20px; text-align:center; margin:20px 0;">
                <div style="font-size:12px; color:#7c7c88; margin-bottom:6px;">6-Digit Code (Valid for 10 minutes)</div>
                <div style="font-family:monospace; font-size:32px; font-weight:700; letter-spacing:8px; color:#111114;">${safeOtp}</div>
            </div>
        </div>
    </body>
    </html>
    `;
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
        const name = String(body.name || 'Student').trim();
        const grade = String(body.grade || 'Class 12').trim();
        const mode = String(body.mode || 'signup').toLowerCase() === 'reset' ? 'reset' : 'signup';

        if (!email || !isValidEmailFormat(email)) {
            return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
        }

        const canonical = canonicalizeEmail(email);
        const existingAccount = findAccountByEmail(email);

        // Enforce 1 account per Gmail inbox on sign-up
        if (mode === 'signup' && existingAccount) {
            return res.status(409).json({
                ok: false,
                code: 'EMAIL_EXISTS',
                existingEmail: existingAccount.email,
                canonicalEmail: canonical,
                error: 'An account already exists for this Gmail address. Please sign in or reset your password.'
            });
        }

        // For password reset, ensure an account exists for that inbox
        if (mode === 'reset' && !existingAccount) {
            return res.status(404).json({
                ok: false,
                code: 'ACCOUNT_NOT_FOUND',
                error: 'No account found for this email address. Please create a new account.'
            });
        }

        const otp = String(crypto.randomInt(100000, 1000000));
        const expiresAt = Date.now() + OTP_TTL_MS;
        const otpToken = createSignedOtpToken(email, otp, expiresAt, mode);

        global.__BPG_OTP_STORE__.set(`${canonical}|${mode}`, {
            otp,
            email,
            canonicalEmail: canonical,
            name: existingAccount ? existingAccount.name : name,
            grade: existingAccount ? existingAccount.grade : grade,
            mode,
            expiresAt,
            attempts: 0
        });

        const resendApiKey = process.env.RESEND_API_KEY;
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'BPG Academy <onboarding@resend.dev>';

        if (resendApiKey) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: fromAddress,
                    to: [email],
                    subject: `${otp} is your BPG Academy Verification Code`,
                    html: buildOtpEmailHtml({ name, email, grade, otp, mode })
                })
            });

            if (response.ok) {
                return res.status(200).json({
                    ok: true,
                    mode,
                    provider: 'resend',
                    email,
                    expiresAt,
                    otpToken,
                    message: `A 6-digit verification code has been emailed to ${email}.`
                });
            }
        }

        return res.status(200).json({
            ok: true,
            mode,
            provider: 'local_preview',
            email,
            expiresAt,
            otpToken,
            demoOtp: otp,
            message: `6-digit verification code generated for ${email}.`
        });
    } catch (err) {
        console.error('[BPG OTP Error]:', err);
        return res.status(500).json({
            ok: false,
            error: 'Could not dispatch verification code. Please try again.'
        });
    }
};
