/* ==========================================================================
   BPG ACADEMY — APPLICATION INITIALIZER & REAL-TIME SYNC (js/app-init.js)
   Strict Single-Class Dedicated Architecture
   ========================================================================== */

async function syncRosterPermissionsFromServer() {
    try {
        const res = await fetch('/api/student-roster?_t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.data && Array.isArray(json.data.accounts)) {
            localStorage.setItem(BPG_ACCOUNTS_KEY, JSON.stringify(json.data.accounts));

            // If current student is logged in, sync live class & plan updates from server
            const session = getStoredStudentSession();
            if (session && session.email) {
                const match = json.data.accounts.find(
                    a => (a.email || '').toLowerCase() === session.email.toLowerCase()
                );
                if (match) {
                    const gradeChanged = match.grade && match.grade !== session.grade;
                    const planChanged = match.plan && match.plan !== session.plan;
                    const legacyChanged = Boolean(match.legacyAccess) !== Boolean(session.legacyAccess);

                    if (gradeChanged || planChanged || legacyChanged) {
                        session.grade = match.grade || session.grade;
                        session.classKey = normalizeClassKey(session.grade);
                        session.plan = match.plan || 'free';
                        session.legacyAccess = Boolean(match.legacyAccess);
                        session.planExplicitlySet = Boolean(match.planExplicitlySet);
                        localStorage.setItem(BPG_STUDENT_SESSION_KEY, JSON.stringify(session));
                        localStorage.setItem('bpg_student_session', JSON.stringify(session));
                        localStorage.setItem('bpg_student_class', session.classKey);
                        updateAuthUserPill();
                        syncWithServerDatabase();
                        if (gradeChanged) openMyClassWorkspace();
                    }
                }
            }
        }
    } catch (e) {}
}

function refreshStudentPortalUI() {
    updateAuthUserPill();
    if (typeof renderEntireStudentPortal === 'function') {
        renderEntireStudentPortal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('view-about') && !document.getElementById('view-home')) return;

    initTheme();

    // 1-Person Friend / Guest Preview Link Handler (?pass=friend)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const friendToken = urlParams.get('pass') || urlParams.get('access') || urlParams.get('friend') || urlParams.get('token');
        if (friendToken) {
            const guestName = urlParams.get('name') || 'Guest Scholar';
            const guestGrade = urlParams.get('class') || 'Class 12';
            const normKey = normalizeClassKey(guestGrade);
            const friendAccount = {
                name: guestName,
                email: 'scholar@bpgacademy.edu.np',
                grade: guestGrade,
                classKey: normKey,
                verified: true
            };
            localStorage.setItem(BPG_STUDENT_SESSION_KEY, JSON.stringify(friendAccount));
            localStorage.setItem('bpg_student_session', JSON.stringify(friendAccount));
            localStorage.setItem('bpg_student_class', normKey);
        }
    } catch (e) {}

    // Initial Render of AI Assistant on Homepage
    setTimeout(() => {
        if (document.getElementById('aiChatViewport') && typeof triggerAiConceptPrompt === 'function') {
            triggerAiConceptPrompt('lhopital', null);
        }
    }, 150);

    // 6-digit OTP box paste support
    document.getElementById('otpBoxesWrap')?.addEventListener('paste', e => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            e.preventDefault();
            for (let i = 0; i < 6; i++) {
                const box = document.getElementById(`otpDigit${i}`);
                if (box) box.value = pasted[i] || '';
            }
            document.getElementById(`otpDigit${Math.min(5, pasted.length - 1)}`)?.focus();
        }
    });

    // Render all 4 class workspaces and homepage cards from master state
    if (typeof syncSectionLockBadges === 'function') syncSectionLockBadges();
    renderEntireStudentPortal();
    updateAuthUserPill();
    if (typeof initDraggableCalculator === 'function') initDraggableCalculator();
    if (typeof initScrollRevealAnimations === 'function') initScrollRevealAnimations();
    if (typeof initRoamingWidgets === 'function') initRoamingWidgets();

    // Exclusive Dashboard Routing on boot:
    // If logged in, immediately mount their dedicated class workspace
    const hash = (window.location.hash || '').replace('#', '');
    if (isUserAuthenticated()) {
        if (hash === 'about') {
            scrollToSection('aboutSection');
        } else {
            openMyClassWorkspace();
        }
    } else {
        setActiveNavLink('home');
        if (hash === 'about') scrollToSection('aboutSection');
        else if (hash === 'programs' || hash === 'classes') scrollToSection('coursesSection');
        else if (['entrance', 'c10', 'c11', 'c12'].includes(hash)) handleClassNavClick(hash);
    }

    // Real-Time BroadcastChannel & Central Database Sync Listener
    try {
        if ('BroadcastChannel' in window) {
            const handleIncomingSyncMessage = (ev) => {
                if (!ev.data) return;
                if (ev.data.type === 'DATA_UPDATED' || ev.data.type === 'BPG_CMS_SYNC' || ev.data.type === 'CMS_UPDATE') {
                    if (ev.data.state && typeof applyIncomingAdminState === 'function') {
                        applyIncomingAdminState(ev.data.state);
                    } else {
                        loadStateFromStorage();
                        renderActivePortal();
                        syncWithServerDatabase();
                    }
                    syncRosterPermissionsFromServer();
                    updateAuthUserPill();
                    showToastNotification('Website updated with latest academic data.');
                } else if (ev.data.type === 'PERMISSIONS_UPDATE') {
                    syncRosterPermissionsFromServer();
                    updateAuthUserPill();
                    showToastNotification('Student roster updated from Admin Studio.');
                }
            };

            const primarySyncCh = new BroadcastChannel('bpg_academy_sync');
            primarySyncCh.onmessage = handleIncomingSyncMessage;

            const legacySyncCh = new BroadcastChannel(BPG_SYNC_CHANNEL_NAME);
            legacySyncCh.addEventListener('message', handleIncomingSyncMessage);
        }
    } catch (e) {}

    window.addEventListener('storage', ev => {
        if ((ev.key === 'bpg_master_db' || ev.key === 'bpg_master_database_v1' || ev.key === BPG_STORAGE_KEY) && ev.newValue) {
            try {
                const parsed = JSON.parse(ev.newValue);
                applyIncomingAdminState(parsed);
                showToastNotification('Website updated with latest academic data.');
            } catch (err) {}
        } else if (ev.key === BPG_ACCOUNTS_KEY && ev.newValue) {
            syncRosterPermissionsFromServer();
            updateAuthUserPill();
        }
    });

    // Initial Database & Roster Hydration on Load
    syncWithServerDatabase();
    syncRosterPermissionsFromServer();

    // Cache Invalidation: Re-fetch on tab focus
    window.addEventListener('focus', () => {
        syncWithServerDatabase();
        syncRosterPermissionsFromServer();
    });

    // Periodic Heartbeat Poll every 12 seconds for cross-device updates
    setInterval(() => {
        syncWithServerDatabase();
    }, 12000);
});

// Global API & Window Interop Bindings
window.handleSendOtpRequest = handleRequestEmailOtp;
window.handleVerifyOtpCode = handleVerifyEmailOtp;
window.handleResendOtp = resendEmailOtpCode;
window.toggleCalculatorWidget = toggleMiniCalculator;
window.switchPortal = switchPortal;
window.handleHomeClick = handleHomeClick;
window.handleClassNavClick = handleClassNavClick;
window.handleProgramCardClick = handleProgramCardClick;
window.showRestrictedAccessModal = showRestrictedAccessModal;
window.closeRestrictedAccessModal = closeRestrictedAccessModal;
window.showSectionLockedModal = showSectionLockedModal;
window.closeSectionLockedModal = closeSectionLockedModal;
window.openPlanComparisonModal = openPlanComparisonModal;
window.closePlanComparisonModal = closePlanComparisonModal;
window.syncSectionLockBadges = syncSectionLockBadges;
window.handleRequestPasswordResetOtp = handleRequestPasswordResetOtp;
window.switchToSignInWithEmail = switchToSignInWithEmail;
window.switchToResetWithEmail = switchToResetWithEmail;
window.handleSwitchAccountRegister = handleSwitchAccountRegister;
window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.scrollToSection = scrollToSection;
window.handleSignOut = handleSignOut;
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;
window.updateAuthUserPill = updateAuthUserPill;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleSignInSubmit = handleSignInSubmit;
window.quickOtpSignIn = quickOtpSignIn;
window.toggleWebsiteGuide = toggleWebsiteGuide;
window.closeWebsiteGuide = closeWebsiteGuide;
window.askGuideQuestion = askGuideQuestion;
window.openAiWithPrompt = openAiWithPrompt;
window.handleAiQuerySubmit = handleAiQuerySubmit;
window.submitAiPromptText = submitAiPromptText;
window.clearAiChat = clearAiChat;
window.initRoamingWidgets = initRoamingWidgets;
window.refreshStudentPortalUI = refreshStudentPortalUI;
window.syncRosterPermissionsFromServer = syncRosterPermissionsFromServer;
