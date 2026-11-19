/* ==========================================================================
   BPG ACADEMY — MODULAR UI TEMPLATES MOUNTER (js/ui-templates.js)
   Strict Single-Class Dedicated Architecture:
   - Exactly 4 Dedicated Tabs per workspace (Syllabus, Units, Calendar, Notes)
   - Mandatory Single-Class Registration Wall
   - Restricted Access Modal for cross-program gating
   - PDF Viewer & Live Zoom Session modals
   ========================================================================== */

(function mountBpgModularTemplates() {
    const workspacesMount = document.getElementById('bpgWorkspacesMount');
    if (workspacesMount) {
        workspacesMount.outerHTML = `
    <!-- ==========================================================================
         VIEW 2: CLASS 10 (SEE) WORKSPACE (#view-c10) — 4 DEDICATED TABS
         ========================================================================== -->
    <main class="view-container portal-view" id="view-c10" style="display:none;">
        <div class="container">
            <!-- Workspace Navigation Bar with Back Button -->
            <div class="workspace-top-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <button type="button" class="btn-back" onclick="handleHomeClick()">← Back to Dashboard</button>
                <div class="breadcrumb-nav">
                    <a href="#home" onclick="handleHomeClick(); return false;">Home</a>
                    <span>/</span>
                    <span>Class Portals</span>
                    <span>/</span>
                    <span>Class 10 (SEE Mathematics Foundation)</span>
                </div>
            </div>

            <!-- Course Overview Hero -->
            <div class="course-workspace-hero">
                <div class="course-detail-thumbnail">
                    <img src="images/thumb_c10.jpg" id="heroThumb-class-10" alt="Class 10 SEE Mathematics Thumbnail">
                </div>
                <div class="course-hero-content">
                    <h1 id="heroTitle-class-10">Class 10 (SEE Mathematics Foundation)</h1>
                    <p id="heroDesc-class-10">
                        A complete Class 10 Compulsory &amp; Optional Mathematics preparation course. Comprehensive geometric circle theorem step-proofs, unseen rider derivations, coordinate geometry, matrices, trigonometry, and model question sets.
                    </p>
                    <div class="course-meta-pills-row">
                        <span class="course-meta-pill" id="heroLessons-class-10"><i class="fa-solid fa-video"></i> 2 lessons</span>
                        <span class="course-meta-pill" id="heroNotes-class-10"><i class="fa-solid fa-file-pdf"></i> 6 notes</span>
                        <span class="course-meta-pill" id="heroLive-class-10"><i class="fa-solid fa-tower-broadcast"></i> Sunday Live Batch</span>
                    </div>
                </div>
            </div>

            <!-- Class-Specific 4-Tab Taskbar (Access Plans Tab Completely Removed) -->
            <div class="understated-tab-strip" role="tablist" aria-label="Class 10 Sub-Taskbar">
                <button class="strip-tab-btn active" id="tab-c10-syllabus" onclick="switchClassTab('c10', 'syllabus', this)">
                    <i class="fa-solid fa-table-list"></i> 1. Syllabus Blueprint
                </button>
                <button class="strip-tab-btn" id="tab-c10-units" onclick="switchClassTab('c10', 'units', this)">
                    <i class="fa-solid fa-book-open-reader"></i> 2. Units &amp; Theory
                </button>
                <button class="strip-tab-btn" id="tab-c10-live" onclick="switchClassTab('c10', 'live', this)">
                    <i class="fa-regular fa-calendar-check"></i> 3. Live Class Calendar
                </button>
                <button class="strip-tab-btn" id="tab-c10-notes" onclick="switchClassTab('c10', 'notes', this)">
                    <i class="fa-regular fa-file-pdf"></i> 4. Notes &amp; PDFs
                </button>
            </div>

            <!-- Tab Panes Container for Class 10 (Exactly 4 functional panes) -->
            <div id="classContentPanes-c10">
                <div class="portal-tab-pane active" id="pane-c10-syllabus">
                    <div id="syllabusContainer-class-10"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c10-units">
                    <div class="deep-reader-layout">
                        <aside class="reader-sidebar" id="readerSidebar-class-10"></aside>
                        <div class="reader-canvas" id="readerCanvas-class-10"></div>
                    </div>
                </div>
                <div class="portal-tab-pane" id="pane-c10-live">
                    <div id="calendarContainer-class-10"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c10-notes">
                    <div id="notesContainer-class-10"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- ==========================================================================
         VIEW 3: GRADE XI MATHEMATICS WORKSPACE (#view-c11) — 4 DEDICATED TABS
         ========================================================================== -->
    <main class="view-container portal-view" id="view-c11" style="display:none;">
        <div class="container">
            <!-- Workspace Navigation Bar with Back Button -->
            <div class="workspace-top-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <button type="button" class="btn-back" onclick="handleHomeClick()">← Back to Dashboard</button>
                <div class="breadcrumb-nav">
                    <a href="#home" onclick="handleHomeClick(); return false;">Home</a>
                    <span>/</span>
                    <span>Class Portals</span>
                    <span>/</span>
                    <span>Grade XI Mathematics</span>
                </div>
            </div>

            <!-- Course Overview Hero -->
            <div class="course-workspace-hero">
                <div class="course-detail-thumbnail">
                    <img src="images/thumb_c11.jpg" id="heroThumb-class-11" alt="Grade XI Mathematics Thumbnail">
                </div>
                <div class="course-hero-content">
                    <h1 id="heroTitle-class-11">Grade XI Mathematics</h1>
                    <p id="heroDesc-class-11">
                        A complete Grade XI Mathematics course designed according to the current NEB curriculum. Provides clear conceptual explanations, step-by-step problem solving, worked examples, practice exercises, and exam-focused preparation.
                    </p>
                    <div class="course-meta-pills-row">
                        <span class="course-meta-pill" id="heroLessons-class-11"><i class="fa-solid fa-video"></i> 2 lessons</span>
                        <span class="course-meta-pill" id="heroNotes-class-11"><i class="fa-solid fa-file-pdf"></i> 6 notes</span>
                        <span class="course-meta-pill" id="heroLive-class-11"><i class="fa-solid fa-tower-broadcast"></i> Weekly Zoom Batch</span>
                    </div>
                </div>
            </div>

            <!-- Class-Specific 4-Tab Taskbar (Access Plans Tab Completely Removed) -->
            <div class="understated-tab-strip" role="tablist" aria-label="Class 11 Sub-Taskbar">
                <button class="strip-tab-btn active" id="tab-c11-syllabus" onclick="switchClassTab('c11', 'syllabus', this)">
                    <i class="fa-solid fa-table-list"></i> 1. Syllabus Blueprint
                </button>
                <button class="strip-tab-btn" id="tab-c11-units" onclick="switchClassTab('c11', 'units', this)">
                    <i class="fa-solid fa-book-open-reader"></i> 2. Units &amp; Theory
                </button>
                <button class="strip-tab-btn" id="tab-c11-live" onclick="switchClassTab('c11', 'live', this)">
                    <i class="fa-regular fa-calendar-check"></i> 3. Live Class Calendar
                </button>
                <button class="strip-tab-btn" id="tab-c11-notes" onclick="switchClassTab('c11', 'notes', this)">
                    <i class="fa-regular fa-file-pdf"></i> 4. Notes &amp; PDFs
                </button>
            </div>

            <!-- Tab Panes Container for Class 11 (Exactly 4 functional panes) -->
            <div id="classContentPanes-c11">
                <div class="portal-tab-pane active" id="pane-c11-syllabus">
                    <div id="syllabusContainer-class-11"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c11-units">
                    <div class="deep-reader-layout">
                        <aside class="reader-sidebar" id="readerSidebar-class-11"></aside>
                        <div class="reader-canvas" id="readerCanvas-class-11"></div>
                    </div>
                </div>
                <div class="portal-tab-pane" id="pane-c11-live">
                    <div id="calendarContainer-class-11"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c11-notes">
                    <div id="notesContainer-class-11"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- ==========================================================================
         VIEW 4: GRADE XII MATHEMATICS WORKSPACE (#view-c12) — 4 DEDICATED TABS
         ========================================================================== -->
    <main class="view-container portal-view" id="view-c12" style="display:none;">
        <div class="container">
            <!-- Workspace Navigation Bar with Back Button -->
            <div class="workspace-top-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <button type="button" class="btn-back" onclick="handleHomeClick()">← Back to Dashboard</button>
                <div class="breadcrumb-nav">
                    <a href="#home" onclick="handleHomeClick(); return false;">Home</a>
                    <span>/</span>
                    <span>Class Portals</span>
                    <span>/</span>
                    <span>Grade XII Mathematics</span>
                </div>
            </div>

            <!-- Course Overview Hero -->
            <div class="course-workspace-hero">
                <div class="course-detail-thumbnail">
                    <img src="images/thumb_c12.jpg" id="heroThumb-class-12" alt="Grade XII Mathematics Thumbnail">
                </div>
                <div class="course-hero-content">
                    <h1 id="heroTitle-class-12">Grade XII Mathematics</h1>
                    <p id="heroDesc-class-12">
                        A complete Grade XII Mathematics course designed according to the current NEB curriculum. Provides clear conceptual explanations, step-by-step problem-solving techniques, worked examples, practice exercises, and exam-focused distinction preparation.
                    </p>
                    <div class="course-meta-pills-row">
                        <span class="course-meta-pill" id="heroLessons-class-12"><i class="fa-solid fa-video"></i> 2 lessons</span>
                        <span class="course-meta-pill" id="heroNotes-class-12"><i class="fa-solid fa-file-pdf"></i> 6 notes</span>
                        <span class="course-meta-pill" id="heroLive-class-12"><i class="fa-solid fa-tower-broadcast"></i> Saturday Live Batch</span>
                    </div>
                </div>
            </div>

            <!-- Class-Specific 4-Tab Taskbar (Access Plans Tab Completely Removed) -->
            <div class="understated-tab-strip" role="tablist" aria-label="Class 12 Sub-Taskbar">
                <button class="strip-tab-btn active" id="tab-c12-syllabus" onclick="switchClassTab('c12', 'syllabus', this)">
                    <i class="fa-solid fa-table-list"></i> 1. Syllabus Blueprint
                </button>
                <button class="strip-tab-btn" id="tab-c12-units" onclick="switchClassTab('c12', 'units', this)">
                    <i class="fa-solid fa-book-open-reader"></i> 2. Units &amp; Theory
                </button>
                <button class="strip-tab-btn" id="tab-c12-live" onclick="switchClassTab('c12', 'live', this)">
                    <i class="fa-regular fa-calendar-check"></i> 3. Live Class Calendar
                </button>
                <button class="strip-tab-btn" id="tab-c12-notes" onclick="switchClassTab('c12', 'notes', this)">
                    <i class="fa-regular fa-file-pdf"></i> 4. Notes &amp; PDFs
                </button>
            </div>

            <!-- Tab Panes Container for Class 12 (Exactly 4 functional panes) -->
            <div id="classContentPanes-c12">
                <div class="portal-tab-pane active" id="pane-c12-syllabus">
                    <div id="syllabusContainer-class-12"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c12-units">
                    <div class="deep-reader-layout">
                        <aside class="reader-sidebar" id="readerSidebar-class-12"></aside>
                        <div class="reader-canvas" id="readerCanvas-class-12"></div>
                    </div>
                </div>
                <div class="portal-tab-pane" id="pane-c12-live">
                    <div id="calendarContainer-class-12"></div>
                </div>
                <div class="portal-tab-pane" id="pane-c12-notes">
                    <div id="notesContainer-class-12"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- ==========================================================================
         VIEW 5: AFTER 12 ENTRANCE WORKSPACE (#view-entrance) — 4 DEDICATED TABS
         ========================================================================== -->
    <main class="view-container portal-view" id="view-entrance" style="display:none;">
        <div class="container">
            <!-- Workspace Navigation Bar with Back Button -->
            <div class="workspace-top-bar" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <button type="button" class="btn-back" onclick="handleHomeClick()">← Back to Dashboard</button>
                <div class="breadcrumb-nav">
                    <a href="#home" onclick="handleHomeClick(); return false;">Home</a>
                    <span>/</span>
                    <span>Class Portals</span>
                    <span>/</span>
                    <span>After 12 Entrance (IOE / CEE / KU)</span>
                </div>
            </div>

            <!-- Course Overview Hero -->
            <div class="course-workspace-hero">
                <div class="course-detail-thumbnail">
                    <img src="images/thumb_entrance.jpg" id="heroThumb-after-12" alt="After 12 Engineering Entrance Thumbnail">
                </div>
                <div class="course-hero-content">
                    <h1 id="heroTitle-after-12">After 12 Entrance (IOE / CEE / KU Question Bank &amp; Speed Hacks)</h1>
                    <p id="heroDesc-after-12">
                        Complete 50-mark IOE Pulchowk Mathematics engineering entrance preparation with 15-year past question bank, Casio fx-991 calculator speed hacks, option elimination techniques, and CBT model practice sets.
                    </p>
                    <div class="course-meta-pills-row">
                        <span class="course-meta-pill" id="heroLessons-after-12"><i class="fa-solid fa-video"></i> 2 lessons</span>
                        <span class="course-meta-pill" id="heroNotes-after-12"><i class="fa-solid fa-file-pdf"></i> 6 notes</span>
                        <span class="course-meta-pill" id="heroLive-after-12"><i class="fa-solid fa-tower-broadcast"></i> Daily Ranker Batch</span>
                    </div>
                </div>
            </div>

            <!-- Class-Specific 4-Tab Taskbar (Access Plans Tab Completely Removed) -->
            <div class="understated-tab-strip" role="tablist" aria-label="Entrance Sub-Taskbar">
                <button class="strip-tab-btn active" id="tab-entrance-syllabus" onclick="switchClassTab('entrance', 'syllabus', this)">
                    <i class="fa-solid fa-table-list"></i> 1. Syllabus Blueprint
                </button>
                <button class="strip-tab-btn" id="tab-entrance-units" onclick="switchClassTab('entrance', 'units', this)">
                    <i class="fa-solid fa-book-open-reader"></i> 2. Speed Hacks &amp; Theory
                </button>
                <button class="strip-tab-btn" id="tab-entrance-live" onclick="switchClassTab('entrance', 'live', this)">
                    <i class="fa-regular fa-calendar-check"></i> 3. Live Class Calendar
                </button>
                <button class="strip-tab-btn" id="tab-entrance-notes" onclick="switchClassTab('entrance', 'notes', this)">
                    <i class="fa-regular fa-file-pdf"></i> 4. Notes &amp; Past Papers
                </button>
            </div>

            <!-- Tab Panes Container for Entrance (Exactly 4 functional panes) -->
            <div id="classContentPanes-entrance">
                <div class="portal-tab-pane active" id="pane-entrance-syllabus">
                    <div id="syllabusContainer-after-12"></div>
                </div>
                <div class="portal-tab-pane" id="pane-entrance-units">
                    <div class="deep-reader-layout">
                        <aside class="reader-sidebar" id="readerSidebar-after-12"></aside>
                        <div class="reader-canvas" id="readerCanvas-after-12"></div>
                    </div>
                </div>
                <div class="portal-tab-pane" id="pane-entrance-live">
                    <div id="calendarContainer-after-12"></div>
                </div>
                <div class="portal-tab-pane" id="pane-entrance-notes">
                    <div id="notesContainer-after-12"></div>
                </div>
            </div>
        </div>
    </main>
`;
    }

    const modalsMount = document.getElementById('bpgModalsMount');
    if (modalsMount) {
        modalsMount.outerHTML = `
    <!-- ==========================================================================
         DOCKED UTILITIES: BPG AI ASSISTANT & MINI SCIENTIFIC CALCULATOR
         ========================================================================== -->
    <div class="floating-dock-container" id="floatingDock">
        <button type="button" id="miniCalcBtn" class="floating-dock-btn calc-btn" onclick="toggleMiniCalculator()" title="Open Casio FX-991 Scientific Calculator" aria-label="Open Calculator">
            <i class="fa-solid fa-calculator" aria-hidden="true"></i>
        </button>
        <button type="button" id="btnSiteGuide" class="floating-dock-btn ai-trigger-btn" onclick="toggleWebsiteGuide()" title="Ask BPG Academy AI">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
            <span>Ask BPG AI</span>
        </button>
    </div>

    <!-- Interactive BPG Academy AI Assistant Window -->
    <div class="site-guide-window" id="siteGuideWindow" role="dialog" aria-labelledby="guideTitle" aria-hidden="true">
        <div class="guide-window-header">
            <div class="guide-header-brand">
                <div class="guide-ai-avatar" aria-hidden="true">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div class="guide-header-text">
                    <h3 id="guideTitle">BPG Academy AI</h3>
                    <span class="guide-status-badge"><span class="guide-status-dot"></span> Online &middot; Ask about classes, syllabus &amp; schedules</span>
                </div>
            </div>
            <div class="guide-header-actions">
                <button type="button" class="guide-ctrl-btn" onclick="clearAiChat()" title="New Chat" aria-label="Reset conversation"><i class="fa-solid fa-rotate-right"></i></button>
                <button type="button" class="guide-ctrl-btn" onclick="closeWebsiteGuide()" title="Close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>

        <!-- Chat Stream Conversation Feed -->
        <div class="guide-chat-stream" id="guideChatStream">
            <div class="guide-msg bot-msg">
                <div class="guide-msg-avatar">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div class="guide-msg-content">
                    <p><strong>Namaste!</strong> I&rsquo;m the <strong>BPG Academy AI</strong>.</p>
                    <p>Ask me anything about <strong>Class 10, Class 11, Class 12, or IOE / CEE Entrance</strong> &mdash; syllabus units, marks weightage, live Zoom timings, notes, or how to enroll.</p>
                </div>
            </div>
        </div>

        <!-- Typing Indicator -->
        <div class="guide-typing-indicator" id="guideTypingIndicator" style="display:none;">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>

        <!-- Quick Suggested Prompts -->
        <div class="guide-quick-replies-wrap" id="quickReplyWrap">
            <div class="quick-reply-pills-row" id="quickReplyPills">
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('Tell me about Class 12')">Class 12 Info</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('Tell me about Class 11')">Class 11 Info</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('Tell me about Class 10 SEE')">Class 10 (SEE)</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('Tell me about IOE Entrance')">IOE Entrance</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('When are the live Zoom classes?')">Live Zoom Timings</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('How do I register and get notes?')">How to Enroll</button>
                <button type="button" class="guide-pill-btn" onclick="submitAiPromptText('Who is BPG Sir?')">About BPG Sir</button>
            </div>
        </div>

        <!-- Live Interactive Question Input -->
        <form class="guide-input-bar" id="aiQueryForm" onsubmit="handleAiQuerySubmit(event)">
            <input type="text" id="aiQueryInput" class="guide-input-field" placeholder="Ask about any class, syllabus, Zoom time, or topic..." autocomplete="off" aria-label="Ask BPG Academy AI">
            <button type="submit" id="aiSendBtn" class="guide-send-btn" aria-label="Send message"><i class="fa-solid fa-arrow-up"></i></button>
        </form>
    </div>

    <!-- Draggable Mini Scientific Calculator Viewport -->
    <div class="calc-flyout-window" id="calcFlyoutWindow">
        <div class="calc-window-header" id="calcDragHandle">
            <span><i class="fa-solid fa-calculator"></i> Casio FX-991 Mini Solver</span>
            <button class="calc-close-btn" onclick="toggleMiniCalculator()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="calc-screen-area">
            <div class="calc-history-line" id="calcHistoryLine">DEG</div>
            <div class="calc-lcd-screen" id="calcScreen">0</div>
        </div>
        <div class="calc-keypad-grid">
            <button class="calc-key op" onclick="calcAppend('sin(')">sin</button>
            <button class="calc-key op" onclick="calcAppend('cos(')">cos</button>
            <button class="calc-key op" onclick="calcAppend('tan(')">tan</button>
            <button class="calc-key op" onclick="calcAppend('sqrt(')">√</button>
            <button class="calc-key op" onclick="calcAppend('^')">xʸ</button>

            <button class="calc-key func" onclick="calcClear()">AC</button>
            <button class="calc-key func" onclick="calcBackspace()">DEL</button>
            <button class="calc-key op" onclick="calcAppend('(')">(</button>
            <button class="calc-key op" onclick="calcAppend(')')">)</button>
            <button class="calc-key op" onclick="calcAppend('/')">÷</button>

            <button class="calc-key" onclick="calcAppend('7')">7</button>
            <button class="calc-key" onclick="calcAppend('8')">8</button>
            <button class="calc-key" onclick="calcAppend('9')">9</button>
            <button class="calc-key op" onclick="calcAppend('*')">×</button>
            <button class="calc-key op" onclick="calcAppend('pi')">π</button>

            <button class="calc-key" onclick="calcAppend('4')">4</button>
            <button class="calc-key" onclick="calcAppend('5')">5</button>
            <button class="calc-key" onclick="calcAppend('6')">6</button>
            <button class="calc-key op" onclick="calcAppend('-')">-</button>
            <button class="calc-key op" onclick="calcAppend('e')">e</button>

            <button class="calc-key" onclick="calcAppend('1')">1</button>
            <button class="calc-key" onclick="calcAppend('2')">2</button>
            <button class="calc-key" onclick="calcAppend('3')">3</button>
            <button class="calc-key op" onclick="calcAppend('+')">+</button>
            <button class="calc-key equals" onclick="calcEvaluate()">=</button>

            <button class="calc-key span-two" onclick="calcAppend('0')">0</button>
            <button class="calc-key" onclick="calcAppend('.')">.</button>
            <button class="calc-key op" onclick="calcAppend('ln(')">ln</button>
        </div>
    </div>

    <!-- ==========================================================================
         AUTHENTICATION & STRICT SINGLE-CLASS REGISTRATION MODAL
         ========================================================================== -->
    <div class="modal-backdrop" id="authModal" role="dialog" aria-modal="true">
        <div class="modal-card auth-modal-card">
            <button class="btn-modal-dismiss" onclick="closeAuthModal()"><i class="fa-solid fa-xmark"></i></button>

            <!-- Tab Switcher -->
            <div class="auth-tabs-nav" role="tablist">
                <button type="button" class="auth-tab-btn active" id="authTabSignIn" onclick="switchAuthTab('signin')" role="tab" aria-selected="true">Sign In</button>
                <button type="button" class="auth-tab-btn" id="authTabSignUp" onclick="switchAuthTab('signup')" role="tab" aria-selected="false">Create Account</button>
            </div>

            <!-- PANE 1: SIGN IN -->
            <div id="authSignInContainer" class="auth-pane active">
                <h3 class="modal-title">Sign In</h3>
                <p class="modal-sub">
                    Enter your registered email and password to open your class workspace.
                </p>

                <div id="signinErrorBanner" class="auth-inline-alert" style="display:none;"></div>

                <form onsubmit="handleSignInSubmit(event)">
                    <div class="modal-field">
                        <label for="signinEmail">Email</label>
                        <input type="email" id="signinEmail" class="modal-input" placeholder="student@gmail.com" required>
                    </div>

                    <div class="modal-field">
                        <label for="signinPassword">Password</label>
                        <input type="password" id="signinPassword" class="modal-input" placeholder="Enter your password" value="bpgstudent" required>
                    </div>

                    <button type="submit" class="btn-submit-action" id="btnSignInSubmit">
                        Sign In
                    </button>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; font-size:0.84rem;">
                        <button type="button" class="btn-link-action" onclick="switchAuthTab('reset')">Reset password</button>
                        <button type="button" class="btn-link-action" onclick="switchAuthTab('signup')">Create account &rarr;</button>
                    </div>
                </form>
            </div>

            <!-- PANE 2: CREATE ACCOUNT (ONE ACCOUNT PER GMAIL, STARTS ON FREE) -->
            <div id="otpStep1Container" class="auth-pane" style="display:none;">
                <h3 class="modal-title">Create Account</h3>
                <p class="modal-sub">
                    New accounts start on the Free plan. One account is allowed per Gmail inbox.
                </p>

                <div id="signupDuplicateBanner" class="auth-inline-alert" style="display:none;">
                    <p id="signupDuplicateMsg" style="margin:0 0 10px 0;">An account already exists for this Gmail address.</p>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-primary" style="padding:7px 14px; font-size:0.82rem;" onclick="switchToSignInWithEmail()">Sign In</button>
                        <button type="button" class="btn btn-secondary" style="padding:7px 14px; font-size:0.82rem;" onclick="switchToResetWithEmail()">Reset Password</button>
                    </div>
                </div>

                <form onsubmit="handleRequestEmailOtp(event)">
                    <div class="modal-field">
                        <label for="signupName">Full Name</label>
                        <input type="text" id="signupName" class="modal-input" placeholder="Your name" required>
                    </div>

                    <div class="modal-field">
                        <label for="signupGrade">Class</label>
                        <select id="signupGrade" class="modal-input" required>
                            <option value="Class 12" selected>Class 12 (NEB Mat. 102)</option>
                            <option value="Class 11">Class 11 (NEB Mat. 101)</option>
                            <option value="Class 10" id="signupOpt-class-10">Class 10 (Locked — Temporarily unavailable)</option>
                            <option value="After 12" id="signupOpt-after-12">Entrance Prep (Locked — Temporarily unavailable)</option>
                        </select>
                    </div>

                    <div class="modal-field">
                        <label for="signupEmail">Gmail / Email</label>
                        <input type="email" id="signupEmail" class="modal-input" placeholder="student@gmail.com" required>
                    </div>

                    <div class="modal-field">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" class="modal-input" placeholder="Create a password" minlength="4" required>
                    </div>

                    <button type="submit" class="btn-submit-action" id="btnSendOtpSubmit">
                        Send Verification Code
                    </button>

                    <div style="text-align:center; margin-top:14px; font-size:0.84rem;">
                        <button type="button" class="btn-link-action" onclick="switchAuthTab('signin')">Already registered? Sign In</button>
                    </div>
                </form>
            </div>

            <!-- PANE 3: RESET PASSWORD (REQUEST 6-DIGIT OTP) -->
            <div id="authResetContainer" class="auth-pane" style="display:none;">
                <h3 class="modal-title">Reset Password</h3>
                <p class="modal-sub">
                    Enter your registered Gmail address and a new password. We will verify it with a 6-digit code.
                </p>

                <div id="resetErrorBanner" class="auth-inline-alert" style="display:none;"></div>

                <form onsubmit="handleRequestPasswordResetOtp(event)">
                    <div class="modal-field">
                        <label for="resetEmail">Registered Email</label>
                        <input type="email" id="resetEmail" class="modal-input" placeholder="student@gmail.com" required>
                    </div>

                    <div class="modal-field">
                        <label for="resetNewPassword">New Password</label>
                        <input type="password" id="resetNewPassword" class="modal-input" placeholder="Enter a new password" minlength="4" required>
                    </div>

                    <button type="submit" class="btn-submit-action" id="btnResetOtpSubmit">
                        Send Reset Code
                    </button>

                    <div style="text-align:center; margin-top:14px; font-size:0.84rem;">
                        <button type="button" class="btn-link-action" onclick="switchAuthTab('signin')">&larr; Back to Sign In</button>
                    </div>
                </form>
            </div>

            <!-- STEP 2: ENTER & VERIFY 6-DIGIT OTP -->
            <div id="otpStep2Container" class="auth-pane" style="display:none;">
                <h3 class="modal-title" id="otpStep2Heading">Verify Code</h3>
                <p class="modal-sub">
                    Enter the 6-digit code sent to <strong id="otpTargetEmailBadge" style="color:var(--text-primary);">your email</strong>.
                </p>

                <!-- Local Fallback OTP Alert Box -->
                <div class="local-otp-banner" id="otpLocalPreviewBanner" style="display:none;">
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:3px;">Verification Code</div>
                    <div class="local-otp-code-highlight" id="otpPreviewCodeValue">894215</div>
                </div>

                <form onsubmit="handleVerifyEmailOtp(event)">
                    <div class="otp-boxes-grid" id="otpBoxesWrap">
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit0" inputmode="numeric" oninput="handleOtpBoxInput(0, this)" onkeydown="handleOtpBoxKeydown(0, event)" autofocus required>
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit1" inputmode="numeric" oninput="handleOtpBoxInput(1, this)" onkeydown="handleOtpBoxKeydown(1, event)" required>
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit2" inputmode="numeric" oninput="handleOtpBoxInput(2, this)" onkeydown="handleOtpBoxKeydown(2, event)" required>
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit3" inputmode="numeric" oninput="handleOtpBoxInput(3, this)" onkeydown="handleOtpBoxKeydown(3, event)" required>
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit4" inputmode="numeric" oninput="handleOtpBoxInput(4, this)" onkeydown="handleOtpBoxKeydown(4, event)" required>
                        <input type="text" maxlength="1" class="otp-digit-box" id="otpDigit5" inputmode="numeric" oninput="handleOtpBoxInput(5, this)" onkeydown="handleOtpBoxKeydown(5, event)" required>
                    </div>

                    <button type="submit" class="btn-submit-action" id="btnVerifyOtpSubmit">
                        Verify &amp; Continue
                    </button>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; font-size:0.84rem;">
                        <button type="button" class="btn-resend-link" onclick="resendEmailOtpCode()">Resend code</button>
                        <button type="button" class="btn-link-action" onclick="switchAuthTab('signup')">&larr; Back</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         SECTION LOCKED MODAL (CLASS 10 & ENTRANCE PREP TEMPORARY LOCK)
         ========================================================================== -->
    <div class="modal-backdrop" id="sectionLockedModal" role="dialog" aria-modal="true">
        <div class="modal-card" style="max-width:440px; padding:28px 24px; text-align:left;">
            <button class="btn-modal-dismiss" onclick="closeSectionLockedModal()"><i class="fa-solid fa-xmark"></i></button>
            <div style="margin-bottom:12px;">
                <span class="section-status-badge locked">Locked</span>
            </div>
            <h3 id="sectionLockedTitle" style="font-size:1.2rem; font-weight:600; color:var(--text-primary); margin-bottom:8px;">Section Locked</h3>
            <p id="sectionLockedMessage" style="font-size:0.92rem; line-height:1.6; color:var(--text-secondary); margin-bottom:20px;">
                Temporarily unavailable. This section is currently closed for all plans and will reopen soon.
            </p>
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn btn-primary" onclick="closeSectionLockedModal()" style="padding:9px 18px; font-size:0.88rem;">
                    OK
                </button>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         PLAN COMPARISON MODAL (ONLY OPENED FROM RESTRICTED CONTENT "VIEW PLANS")
         ========================================================================== -->
    <div class="modal-backdrop" id="planComparisonModal" role="dialog" aria-modal="true">
        <div class="modal-card plan-comparison-card" style="max-width:860px; padding:28px;">
            <button class="btn-modal-dismiss" onclick="closePlanComparisonModal()"><i class="fa-solid fa-xmark"></i></button>
            <div style="margin-bottom:20px;">
                <h3 style="font-size:1.32rem; font-weight:700; margin:0 0 6px 0;">Choose a Plan</h3>
                <p id="planComparisonSubtitle" style="font-size:0.92rem; color:var(--text-secondary); margin:0;">
                    Compare Free, Gold, and Diamond access across open sections.
                </p>
            </div>
            <div class="plan-compare-grid" id="planComparisonGrid"></div>
            <div class="plan-payment-box" id="planPaymentBox">
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
                    <div style="max-width:520px;">
                        <strong style="display:block; font-size:0.94rem; margin-bottom:4px;">Upgrade via eSewa / Khalti or WhatsApp</strong>
                        <p style="font-size:0.84rem; color:var(--text-secondary); margin:0;">
                            Send your payment screenshot and registered Gmail address on WhatsApp to activate your upgraded plan.
                        </p>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="images/payment_qr.png" alt="Payment QR" style="width:68px; height:68px; border-radius:8px; border:1px solid var(--border-subtle); object-fit:contain; background:#fff;" onerror="this.style.display='none'">
                        <a id="planUpgradeWhatsappLink" href="https://wa.me/9779841000000?text=Namaste%20BPG%20Sir%2C%20I%20would%20like%20to%20upgrade%20my%20BPG%20Academy%20plan." target="_blank" rel="noopener" class="btn btn-primary" style="padding:10px 16px; font-size:0.86rem; text-decoration:none;">
                            <i class="fa-brands fa-whatsapp"></i> Confirm on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================================================
         RESTRICTED ACCESS ALERT MODAL (SINGLE-CLASS DEDICATED ARCHITECTURE)
         ========================================================================== -->
    <div class="modal-backdrop" id="restrictedAccessModal" role="dialog" aria-modal="true">
        <div class="modal-card" style="max-width:440px; padding:28px 24px; text-align:left;">
            <button class="btn-modal-dismiss" onclick="closeRestrictedAccessModal()"><i class="fa-solid fa-xmark"></i></button>
            <h3 style="font-size:1.15rem; font-weight:600; color:var(--text-primary); margin-bottom:8px;">Different Class Program</h3>
            <p id="restrictedAccessMessage" style="font-size:0.88rem; line-height:1.6; color:var(--text-secondary); margin-bottom:20px;">
                Your ID is registered exclusively for <strong>Grade XII Mathematics</strong>. To enroll in a different program, please register a new account.
            </p>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button type="button" class="btn btn-primary" onclick="handleSwitchAccountRegister()" style="padding:10px 16px; font-size:0.86rem; justify-content:center;">
                    Register Account for This Class
                </button>
                <button type="button" class="btn btn-secondary" onclick="openMyClassWorkspace(); closeRestrictedAccessModal();" style="padding:9px 16px; font-size:0.85rem; justify-content:center;">
                    Return to My Workspace
                </button>
            </div>
        </div>
    </div>

    <!-- Live Zoom Session Detail Modal -->
    <div class="modal-backdrop" id="calendarSessionModal" role="dialog" aria-modal="true">
        <div class="modal-card" style="max-width: 580px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="modal-head-tag" style="margin: 0;">Live Zoom Class Details</span>
                <button class="btn-modal-dismiss static" onclick="closeCalendarSessionModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="calendarSessionModalBody"></div>
        </div>
    </div>

    <!-- PDF / Formula Sheet Viewer Modal -->
    <div class="modal-backdrop pdf-reader-modal" id="pdfViewerModal" role="dialog" aria-modal="true">
        <div class="modal-card pdf-reader-card" style="max-width: 780px;">
            <div class="pdf-reader-bar" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge-free" id="pdfModalBadge" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 999px;">Verified Resource</span>
                    <h3 id="pdfModalTitle" style="font-size: 1.1rem; margin: 0; color: var(--text-primary);">Mathematical Notes</h3>
                </div>
                <button class="btn-modal-dismiss static" onclick="closePdfViewerModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p id="pdfModalMeta" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 14px;"></p>
            <div id="pdfModalBody" class="pdf-embed-wrapper" style="max-height: 55vh; overflow-y: auto; margin-bottom: 16px;"></div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; padding-top: 12px; border-top: 1px solid var(--border-soft);">
                <a href="#" id="pdfModalDownloadBtn" class="btn btn-secondary" style="font-size: 0.82rem; padding: 8px 14px; text-decoration: none;"><i class="fa-solid fa-download"></i> Download Note / Formula Sheet</a>
                <button class="btn btn-primary" onclick="closePdfViewerModal()" style="font-size: 0.82rem; padding: 8px 14px;">Close Preview</button>
            </div>
        </div>
    </div>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container"></div>
`;
    }
})();
