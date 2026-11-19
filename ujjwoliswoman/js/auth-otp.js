/* BPG Academy — Gmail-Unique Auth, Password Reset & OTP Engine (js/auth-otp.js) */

var BPG_ACCOUNTS_KEY = window.BPG_ACCOUNTS_KEY || 'bpg_maths_academy_accounts_v2';

let pendingOtpSession = {
    name: '',
    email: '',
    grade: 'Class 12',
    password: '',
    mode: 'signup',
    otpToken: '',
    demoOtp: ''
};

let lastDuplicateEmailAttempt = '';

function openAuthModal(initialTab = 'signin', targetClass = null) {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    if (typeof syncSectionLockBadges === 'function') syncSectionLockBadges();

    if (targetClass) {
        pendingTargetClass = normalizeClassKey(targetClass);
        const gradeSelect = document.getElementById('signupGrade');
        if (gradeSelect) {
            if (pendingTargetClass === 'c10' && !isSectionLocked('class-10')) gradeSelect.value = 'Class 10';
            else if (pendingTargetClass === 'c11' && !isSectionLocked('class-11')) gradeSelect.value = 'Class 11';
            else if (pendingTargetClass === 'entrance' && !isSectionLocked('after-12')) gradeSelect.value = 'After 12';
            else if (!isSectionLocked('class-12')) gradeSelect.value = 'Class 12';
            else gradeSelect.value = 'Class 11';
        }
    }

    clearAuthInlineAlerts();
    switchAuthTab(initialTab);
    modal.classList.add('open');
}

function closeAuthModal() {
    document.getElementById('authModal')?.classList.remove('open');
}

function clearAuthInlineAlerts() {
    const dup = document.getElementById('signupDuplicateBanner');
    if (dup) dup.style.display = 'none';
    const siErr = document.getElementById('signinErrorBanner');
    if (siErr) siErr.style.display = 'none';
    const rsErr = document.getElementById('resetErrorBanner');
    if (rsErr) rsErr.style.display = 'none';
}

function switchAuthTab(tab) {
    const signInPane = document.getElementById('authSignInContainer');
    const step1Pane = document.getElementById('otpStep1Container');
    const resetPane = document.getElementById('authResetContainer');
    const step2Pane = document.getElementById('otpStep2Container');
    const tabSignIn = document.getElementById('authTabSignIn');
    const tabSignUp = document.getElementById('authTabSignUp');

    clearAuthInlineAlerts();

    if (signInPane) signInPane.style.display = tab === 'signin' ? 'block' : 'none';
    if (step1Pane) step1Pane.style.display = tab === 'signup' ? 'block' : 'none';
    if (resetPane) resetPane.style.display = tab === 'reset' ? 'block' : 'none';
    if (step2Pane) step2Pane.style.display = 'none';

    if (tabSignIn) {
        tabSignIn.classList.toggle('active', tab === 'signin' || tab === 'reset');
        tabSignIn.setAttribute('aria-selected', String(tab === 'signin'));
    }
    if (tabSignUp) {
        tabSignUp.classList.toggle('active', tab === 'signup');
        tabSignUp.setAttribute('aria-selected', String(tab === 'signup'));
    }
}

function switchToSignInWithEmail() {
    const email = lastDuplicateEmailAttempt || (document.getElementById('signupEmail')?.value || '').trim();
    switchAuthTab('signin');
    const input = document.getElementById('signinEmail');
    if (input && email) {
        input.value = email;
        document.getElementById('signinPassword')?.focus();
    }
}

function switchToResetWithEmail() {
    const email = lastDuplicateEmailAttempt || (document.getElementById('signupEmail')?.value || '').trim();
    switchAuthTab('reset');
    const input = document.getElementById('resetEmail');
    if (input && email) {
        input.value = email;
        document.getElementById('resetNewPassword')?.focus();
    }
}

function getStoredAccounts() {
    try {
        const raw = localStorage.getItem(BPG_ACCOUNTS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
}

function saveStoredAccounts(list) {
    try {
        localStorage.setItem(BPG_ACCOUNTS_KEY, JSON.stringify(list));
    } catch (e) {}
}

async function handleSignInSubmit(e) {
    if (e) e.preventDefault();
    const email = (document.getElementById('signinEmail')?.value || '').trim().toLowerCase();
    const password = (document.getElementById('signinPassword')?.value || '').trim();
    const errBanner = document.getElementById('signinErrorBanner');

    if (errBanner) errBanner.style.display = 'none';

    if (!email) {
        showToast('Please enter your email address.');
        return;
    }

    const btn = document.getElementById('btnSignInSubmit');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Signing in...';
    }

    try {
        const res = await fetch('/api/student-roster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SIGN_IN', email, password })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            if (errBanner) {
                errBanner.innerHTML = `<p style="margin:0;">${data.error || 'Could not sign in.'}</p>`;
                errBanner.style.display = 'block';
            }
            showToast(data.error || 'Sign in failed.');
            return;
        }

        const user = Object.assign({}, data.user, {
            sessionToken: data.sessionToken,
            verified: true
        });
        finalizeVerifiedStudentAccount(user, false);
    } catch (err) {
        showToast('Unable to reach server. Please try again.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    }
}

function quickOtpSignIn() {
    switchAuthTab('reset');
}

function clearOtpDigitBoxes() {
    for (let i = 0; i < 6; i++) {
        const box = document.getElementById(`otpDigit${i}`);
        if (box) box.value = '';
    }
}

function handleOtpBoxInput(idx, inputEl) {
    const val = inputEl.value.replace(/\D/g, '');
    inputEl.value = val.slice(-1);
    if (inputEl.value && idx < 5) {
        document.getElementById(`otpDigit${idx + 1}`)?.focus();
    }
}

function handleOtpBoxKeydown(idx, e) {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        document.getElementById(`otpDigit${idx - 1}`)?.focus();
    }
}

async function handleRequestEmailOtp(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('signupName')?.value.trim() || 'Student';
    const email = (document.getElementById('signupEmail')?.value || '').trim().toLowerCase();
    const grade = document.getElementById('signupGrade')?.value || 'Class 12';
    const password = (document.getElementById('signupPassword')?.value || '').trim() || 'bpgstudent';

    clearAuthInlineAlerts();

    if (!email) {
        showToast('Please enter a valid email address.');
        return;
    }

    // Block registering directly into a locked section
    const classKeyMap = { 'Class 10': 'class-10', 'Class 11': 'class-11', 'Class 12': 'class-12', 'After 12': 'after-12' };
    const mappedClass = classKeyMap[grade] || 'class-12';
    if (typeof isSectionLocked === 'function' && isSectionLocked(mappedClass)) {
        showSectionLockedModal(mappedClass);
        return;
    }

    const btn = document.getElementById('btnSendOtpSubmit');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending code...';
    }

    try {
        const res = await fetch('/api/send-email-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, grade, mode: 'signup' })
        });
        const data = await res.json();

        // Duplicate Gmail inbox detected on backend!
        if (res.status === 409 || data.code === 'EMAIL_EXISTS') {
            lastDuplicateEmailAttempt = data.existingEmail || email;
            const dupBanner = document.getElementById('signupDuplicateBanner');
            const dupMsg = document.getElementById('signupDuplicateMsg');
            if (dupMsg) {
                dupMsg.textContent = data.error || 'An account already exists for this Gmail address. Please sign in or reset your password.';
            }
            if (dupBanner) dupBanner.style.display = 'block';
            showToast('An account already exists for this Gmail address.');
            return;
        }

        if (!res.ok || !data.ok) {
            showToast(data.error || 'Could not send verification code.');
            return;
        }

        pendingOtpSession = {
            name,
            email,
            grade,
            password,
            mode: 'signup',
            otpToken: data.otpToken || '',
            demoOtp: data.demoOtp || ''
        };

        document.getElementById('otpStep1Container').style.display = 'none';
        document.getElementById('otpStep2Container').style.display = 'block';
        const head = document.getElementById('otpStep2Heading');
        if (head) head.textContent = 'Verify Your Email';
        document.getElementById('otpTargetEmailBadge').textContent = `${email} (${grade})`;

        const banner = document.getElementById('otpLocalPreviewBanner');
        const codeEl = document.getElementById('otpPreviewCodeValue');
        if (data.demoOtp && banner && codeEl) {
            banner.style.display = 'flex';
            codeEl.textContent = data.demoOtp;
        } else if (banner) {
            banner.style.display = 'none';
        }

        clearOtpDigitBoxes();
        setTimeout(() => document.getElementById('otpDigit0')?.focus(), 80);
        showToast(data.message || `Verification code sent to ${email}`);
    } catch (err) {
        showToast('Could not connect to server to verify Gmail uniqueness. Please try again.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send Verification Code';
        }
    }
}

async function handleRequestPasswordResetOtp(e) {
    if (e) e.preventDefault();
    const email = (document.getElementById('resetEmail')?.value || '').trim().toLowerCase();
    const newPassword = (document.getElementById('resetNewPassword')?.value || '').trim();
    const errBanner = document.getElementById('resetErrorBanner');
    if (errBanner) errBanner.style.display = 'none';

    if (!email || !newPassword) {
        showToast('Please enter your email and a new password.');
        return;
    }

    const btn = document.getElementById('btnResetOtpSubmit');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending reset code...';
    }

    try {
        const res = await fetch('/api/send-email-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mode: 'reset' })
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
            if (errBanner) {
                errBanner.innerHTML = `<p style="margin:0;">${data.error || 'No account found for this email.'}</p>`;
                errBanner.style.display = 'block';
            }
            return;
        }

        pendingOtpSession = {
            name: '',
            email,
            grade: '',
            password: newPassword,
            mode: 'reset',
            otpToken: data.otpToken || '',
            demoOtp: data.demoOtp || ''
        };

        document.getElementById('authResetContainer').style.display = 'none';
        document.getElementById('otpStep2Container').style.display = 'block';
        const head = document.getElementById('otpStep2Heading');
        if (head) head.textContent = 'Confirm Password Reset';
        document.getElementById('otpTargetEmailBadge').textContent = email;

        const banner = document.getElementById('otpLocalPreviewBanner');
        const codeEl = document.getElementById('otpPreviewCodeValue');
        if (data.demoOtp && banner && codeEl) {
            banner.style.display = 'flex';
            codeEl.textContent = data.demoOtp;
        } else if (banner) {
            banner.style.display = 'none';
        }

        clearOtpDigitBoxes();
        setTimeout(() => document.getElementById('otpDigit0')?.focus(), 80);
    } catch (err) {
        showToast('Unable to send reset code. Please try again.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send Reset Code';
        }
    }
}

function resendEmailOtpCode() {
    if (pendingOtpSession.mode === 'reset') {
        handleRequestPasswordResetOtp(null);
    } else {
        handleRequestEmailOtp(null);
    }
}

async function handleVerifyEmailOtp(e) {
    e.preventDefault();
    let enteredOtp = '';
    for (let i = 0; i < 6; i++) {
        enteredOtp += (document.getElementById(`otpDigit${i}`)?.value || '').trim();
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
        showToast('Please enter all 6 digits of your verification code.');
        return;
    }

    const btn = document.getElementById('btnVerifyOtpSubmit');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Verifying...';
    }

    try {
        const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: pendingOtpSession.name,
                email: pendingOtpSession.email,
                grade: pendingOtpSession.grade,
                newPassword: pendingOtpSession.password,
                mode: pendingOtpSession.mode || 'signup',
                otp: enteredOtp,
                otpToken: pendingOtpSession.otpToken
            })
        });
        const data = await res.json();

        if (res.status === 409 || data.code === 'EMAIL_EXISTS') {
            lastDuplicateEmailAttempt = data.existingEmail || pendingOtpSession.email;
            switchAuthTab('signup');
            const dupBanner = document.getElementById('signupDuplicateBanner');
            const dupMsg = document.getElementById('signupDuplicateMsg');
            if (dupMsg) dupMsg.textContent = data.error;
            if (dupBanner) dupBanner.style.display = 'block';
            return;
        }

        if (!res.ok || !data.ok) {
            showToast(data.error || 'Incorrect 6-digit verification code.');
            return;
        }

        const user = Object.assign({}, data.user, {
            sessionToken: data.sessionToken,
            verified: true
        });
        finalizeVerifiedStudentAccount(user, false);
    } catch (err) {
        showToast('Verification error. Please check your 6-digit code.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Verify & Continue';
        }
    }
}

async function finalizeVerifiedStudentAccount(userObj, shouldPostToRoster = false) {
    const email = (userObj.email || '').toLowerCase();
    const grade = userObj.grade || 'Class 12';
    const normKey = normalizeClassKey(grade);
    const plan = (userObj.plan || 'free').toLowerCase();

    const record = {
        name: userObj.name || 'Student',
        email: email,
        grade: grade,
        classKey: normKey,
        plan: plan,
        legacyAccess: Boolean(userObj.legacyAccess),
        planExplicitlySet: Boolean(userObj.planExplicitlySet),
        sessionToken: userObj.sessionToken || '',
        verified: true,
        joinedAt: userObj.joinedAt || userObj.verifiedAt || new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(BPG_STUDENT_SESSION_KEY, JSON.stringify(record));
    localStorage.setItem('bpg_student_session', JSON.stringify(record));
    localStorage.setItem('bpg_student_class', normKey);

    if (shouldPostToRoster) {
        await fetch('/api/student-roster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newAccount: record })
        }).catch(() => {});
    }

    updateAuthUserPill();
    closeAuthModal();
    await syncWithServerDatabase();
    showToast(`Welcome ${record.name}! Signed in (${plan.charAt(0).toUpperCase() + plan.slice(1)} plan).`);

    openMyClassWorkspace();
}

/* Staggered Scroll Animations */
function initScrollRevealAnimations() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    elements.forEach(el => observer.observe(el));
}

document.addEventListener('click', e => {
    if (!e.target.closest('#notifWrapper')) {
        document.getElementById('notifDrawer')?.classList.remove('open');
    }
});
