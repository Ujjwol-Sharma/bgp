/* ==========================================================================
   BPG ACADEMY — SIMPLIFIED 4-TAB ADMIN PANEL (js/admin-studio.js)
   Tabs: Users | Content | Section Access | Plans & Access
   ========================================================================== */

const ADMIN_PASSKEY = 'bpg2026';
const ADMIN_AUTH_KEY = 'bpg_admin_authenticated_v2';

const SECTION_META = [
    { key: 'class-12', label: 'Class 12', sub: 'Grade XII Mathematics (NEB Mat. 102)' },
    { key: 'class-11', label: 'Class 11', sub: 'Grade XI Mathematics (NEB Mat. 101)' },
    { key: 'class-10', label: 'Class 10 (SEE)', sub: 'SEE Compulsory & Optional Mathematics' },
    { key: 'after-12', label: 'Entrance Prep', sub: 'After 12 Entrance (IOE / CEE / KU)' }
];

let ADMIN_STATE = null;
let ADMIN_ROSTER = { accounts: [], duplicateGroups: [] };
let activeContentClass = 'class-12';
let activeQuestionId = '';
let activePreviewTier = 'free';
let selectedPlanItemKeys = new Set();
let saveIndicatorTimer = null;

/* --------------------------------------------------------------------------
   1. AUTH & INITIALIZATION
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getAdminHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-admin-passkey': ADMIN_PASSKEY
    };
}

function setSaveStatus(text, isSaved = false) {
    const el = document.getElementById('adminSaveIndicator');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('is-saved', isSaved);
    clearTimeout(saveIndicatorTimer);
    if (isSaved) {
        saveIndicatorTimer = setTimeout(() => {
            el.classList.remove('is-saved');
            el.textContent = 'All changes saved';
        }, 2800);
    }
}

function showAdminToast(message, type = 'info') {
    const mount = document.getElementById('adminToastContainer');
    if (!mount) return;
    const div = document.createElement('div');
    div.className = `adm-toast ${type}`;
    div.textContent = message;
    mount.appendChild(div);
    setTimeout(() => div.remove(), 3200);
}

function broadcastUpdate(type = 'DATA_UPDATED') {
    try {
        if ('BroadcastChannel' in window) {
            const ch1 = new BroadcastChannel('bpg_academy_sync');
            ch1.postMessage({ type, timestamp: Date.now() });
            ch1.close();
            const ch2 = new BroadcastChannel('bpg_maths_academy_live_sync');
            ch2.postMessage({ type, timestamp: Date.now() });
            ch2.close();
        }
    } catch (e) {}
}

function handleAdminLogin(e) {
    if (e) e.preventDefault();
    const pass = (document.getElementById('admPass')?.value || '').trim();
    if (pass !== ADMIN_PASSKEY && pass !== 'admin') {
        showAdminToast('Incorrect admin passkey.', 'error');
        return;
    }
    sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
    openAdminShell();
}

function logoutAdmin() {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    document.getElementById('adminShell').style.display = 'none';
    document.getElementById('adminLoginSplash').classList.remove('hidden');
}

async function openAdminShell() {
    document.getElementById('adminLoginSplash')?.classList.add('hidden');
    const shell = document.getElementById('adminShell');
    if (shell) shell.style.display = 'flex';
    await loadAdminData();
}

async function loadAdminData() {
    setSaveStatus('Loading...');
    try {
        const [stateRes, rosterRes] = await Promise.all([
            fetch('/api/academy-state?_t=' + Date.now(), {
                cache: 'no-store',
                headers: { 'x-admin-passkey': ADMIN_PASSKEY }
            }),
            fetch('/api/student-roster?_t=' + Date.now(), {
                cache: 'no-store',
                headers: { 'x-admin-passkey': ADMIN_PASSKEY }
            })
        ]);

        const stateJson = await stateRes.json();
        const rosterJson = await rosterRes.json();

        if (stateJson?.data) ADMIN_STATE = stateJson.data;
        if (rosterJson?.data) ADMIN_ROSTER = rosterJson.data;

        setSaveStatus('All changes saved');
        renderAllAdminTabs();
    } catch (err) {
        setSaveStatus('Offline');
        showAdminToast('Could not load data from server.', 'error');
    }
}

async function persistAcademyState(partialPayload, successMsg = 'Saved') {
    setSaveStatus('Saving...');
    try {
        const res = await fetch('/api/academy-state', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(partialPayload)
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.error || 'Save failed');
        }
        ADMIN_STATE = json.data;
        setSaveStatus('Saved', true);
        showAdminToast(successMsg);
        broadcastUpdate('DATA_UPDATED');
        renderAllAdminTabs();
        return true;
    } catch (err) {
        setSaveStatus('Save error');
        showAdminToast(err.message || 'Could not save changes.', 'error');
        return false;
    }
}

function switchAdminTab(tabName) {
    ['users', 'content', 'sections', 'plans'].forEach(t => {
        document.getElementById(`tabBtn-${t}`)?.classList.toggle('active', t === tabName);
        document.getElementById(`pane-${t}`)?.classList.toggle('active', t === tabName);
    });
    if (tabName === 'users') renderUsersTab();
    if (tabName === 'content') renderContentTab();
    if (tabName === 'sections') renderSectionAccessTab();
    if (tabName === 'plans') renderPlansTab();
}

function renderAllAdminTabs() {
    renderUsersTab();
    renderContentTab();
    renderSectionAccessTab();
    renderPlansTab();
}

/* --------------------------------------------------------------------------
   2. TAB 1: USERS (SEARCH BY NAME/GMAIL, PLAN SELECTOR, DUPLICATE FLAGS)
   -------------------------------------------------------------------------- */
function renderUsersTab() {
    const tbody = document.getElementById('usersTableBody');
    const dupBanner = document.getElementById('duplicateGmailReviewBanner');
    if (!tbody) return;

    const accounts = ADMIN_ROSTER.accounts || [];
    const dupGroups = ADMIN_ROSTER.duplicateGroups || [];

    if (dupBanner) {
        if (dupGroups.length > 0) {
            dupBanner.style.display = 'block';
            dupBanner.innerHTML = `
                <strong>Duplicate Gmail Accounts Flagged for Review (${dupGroups.length})</strong>
                <p style="margin:4px 0 0;">Existing accounts were preserved. Review duplicate inboxes: ${dupGroups.map(g => `<code>${escapeHtml(g.canonicalEmail)}</code> (${g.emails.map(escapeHtml).join(', ')})`).join(' &middot; ')}</p>
            `;
        } else {
            dupBanner.style.display = 'none';
        }
    }

    const q = (document.getElementById('userSearchInput')?.value || '').trim().toLowerCase();
    const filtered = accounts.filter(acc => {
        if (!q) return true;
        return (acc.name || '').toLowerCase().includes(q)
            || (acc.email || '').toLowerCase().includes(q)
            || (acc.canonicalEmail || '').toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:28px; color:var(--adm-text-muted);">No matching students found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(acc => {
        const emailEsc = escapeHtml(acc.email);
        const plan = (acc.plan || 'free').toLowerCase();
        const legacyNote = acc.legacyAccess && !acc.planExplicitlySet
            ? '<div style="font-size:0.72rem; color:var(--adm-text-muted); margin-top:2px;">Existing access preserved</div>'
            : '';
        return `
            <tr>
                <td><strong>${escapeHtml(acc.name || 'Student')}</strong></td>
                <td>
                    <div>${emailEsc}</div>
                    ${acc.duplicateFlag ? '<span class="adm-flag-badge">Duplicate Gmail</span>' : ''}
                </td>
                <td>
                    <select class="adm-select compact" onchange="handleAdminUpdateUserClass('${emailEsc}', this.value)">
                        <option value="Class 12" ${acc.classKey === 'class-12' ? 'selected' : ''}>Class 12</option>
                        <option value="Class 11" ${acc.classKey === 'class-11' ? 'selected' : ''}>Class 11</option>
                        <option value="Class 10" ${acc.classKey === 'class-10' ? 'selected' : ''}>Class 10</option>
                        <option value="After 12 Entrance" ${acc.classKey === 'after-12' ? 'selected' : ''}>Entrance Prep</option>
                    </select>
                </td>
                <td>
                    <select class="adm-select compact" onchange="handleAdminUpdateUserPlan('${emailEsc}', this.value)">
                        <option value="free" ${plan === 'free' ? 'selected' : ''}>Free</option>
                        <option value="gold" ${plan === 'gold' ? 'selected' : ''}>Gold</option>
                        <option value="diamond" ${plan === 'diamond' ? 'selected' : ''}>Diamond</option>
                    </select>
                    ${legacyNote}
                </td>
                <td style="color:var(--adm-text-muted); font-size:0.84rem;">${escapeHtml(acc.joinedAt || '')}</td>
                <td>
                    <button type="button" class="btn-topbar danger" style="padding:5px 10px; font-size:0.78rem;" onclick="handleAdminDeleteUser('${emailEsc}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function handleAdminAddUser(e) {
    e.preventDefault();
    const name = (document.getElementById('newUserName')?.value || '').trim();
    const email = (document.getElementById('newUserEmail')?.value || '').trim().toLowerCase();
    const grade = document.getElementById('newUserGrade')?.value || 'Class 12';
    const plan = document.getElementById('newUserPlan')?.value || 'free';
    if (!name || !email) return;

    setSaveStatus('Saving...');
    try {
        const res = await fetch('/api/student-roster', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({
                action: 'REGISTER_STUDENT',
                student: { name, email, grade, plan }
            })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            setSaveStatus('Not saved');
            showAdminToast(json.error || 'Could not add student.', 'error');
            return;
        }
        ADMIN_ROSTER = json.data;
        document.getElementById('newUserName').value = '';
        document.getElementById('newUserEmail').value = '';
        setSaveStatus('Saved', true);
        showAdminToast('Student added and saved.');
        broadcastUpdate('PERMISSIONS_UPDATE');
        renderUsersTab();
    } catch (err) {
        showAdminToast('Error adding student.', 'error');
    }
}

async function handleAdminUpdateUserPlan(email, newPlan) {
    setSaveStatus('Saving...');
    try {
        const res = await fetch('/api/student-roster', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ action: 'UPDATE_PLAN', email, plan: newPlan })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
        ADMIN_ROSTER = json.data;
        setSaveStatus('Saved', true);
        showAdminToast(`Updated plan to ${newPlan.toUpperCase()}.`);
        broadcastUpdate('PERMISSIONS_UPDATE');
        renderUsersTab();
    } catch (err) {
        showAdminToast(err.message, 'error');
    }
}

async function handleAdminUpdateUserClass(email, newGrade) {
    setSaveStatus('Saving...');
    try {
        const res = await fetch('/api/student-roster', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ action: 'UPDATE_CLASS', email, grade: newGrade })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
        ADMIN_ROSTER = json.data;
        setSaveStatus('Saved', true);
        showAdminToast(`Moved student to ${newGrade}.`);
        broadcastUpdate('PERMISSIONS_UPDATE');
        renderUsersTab();
    } catch (err) {
        showAdminToast(err.message, 'error');
    }
}

async function handleAdminDeleteUser(email) {
    if (!confirm(`Delete student account "${email}"? This cannot be undone.`)) return;
    setSaveStatus('Deleting...');
    try {
        const res = await fetch('/api/student-roster', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ action: 'DELETE_STUDENT', email })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Delete failed');
        ADMIN_ROSTER = json.data;
        setSaveStatus('Saved', true);
        showAdminToast('Student removed.');
        broadcastUpdate('PERMISSIONS_UPDATE');
        renderUsersTab();
    } catch (err) {
        showAdminToast(err.message, 'error');
    }
}

/* --------------------------------------------------------------------------
   3. TAB 2: CONTENT (ADD/EDIT QUESTIONS & UPLOAD PDFS)
   -------------------------------------------------------------------------- */
function handleContentClassChange(classKey) {
    activeContentClass = classKey;
    activeQuestionId = '';
    renderContentTab();
}

function getAllQuestionsInPortal(portal) {
    const list = [];
    (portal?.units || []).forEach((u, uIdx) => {
        (u.topics || []).forEach((t, tIdx) => {
            list.push({ unit: u, unitIdx: uIdx, topic: t, topicIdx: tIdx });
        });
    });
    return list;
}

function renderContentTab() {
    if (!ADMIN_STATE?.portals) return;
    const portal = ADMIN_STATE.portals[activeContentClass];
    if (!portal) return;

    const qListMount = document.getElementById('contentQuestionsList');
    const questions = getAllQuestionsInPortal(portal);

    if (qListMount) {
        if (questions.length === 0) {
            qListMount.innerHTML = `<div style="font-size:0.85rem; color:var(--adm-text-muted); padding:8px;">No questions yet. Click "+ Add Question".</div>`;
        } else {
            if (!activeQuestionId || !questions.some(q => q.topic.id === activeQuestionId)) {
                activeQuestionId = questions[0].topic.id;
            }
            qListMount.innerHTML = questions.map(({ topic }) => {
                const mp = (topic.minPlan || 'free').toLowerCase();
                return `
                    <button type="button" class="adm-list-item ${topic.id === activeQuestionId ? 'active' : ''}" onclick="selectQuestionToEdit('${escapeHtml(topic.id)}')">
                        <span>${escapeHtml(topic.title || 'Untitled Question')}</span>
                        <span class="adm-plan-chip chip-${mp}">${mp}</span>
                    </button>
                `;
            }).join('');
        }
    }

    const activeEntry = questions.find(q => q.topic.id === activeQuestionId);
    if (activeEntry) {
        fillQuestionForm(activeEntry.topic);
    } else {
        startNewQuestion(false);
    }

    // Render PDFs list
    const pdfsMount = document.getElementById('contentPdfsList');
    const notes = portal.notes || [];
    if (pdfsMount) {
        if (notes.length === 0) {
            pdfsMount.innerHTML = `<div style="font-size:0.85rem; color:var(--adm-text-muted);">No PDFs uploaded in this section yet.</div>`;
        } else {
            pdfsMount.innerHTML = notes.map((n, idx) => {
                const mp = (n.minPlan || 'free').toLowerCase();
                const hasFile = Boolean(n.fileUrl || n.url);
                return `
                    <div class="adm-pdf-row">
                        <div>
                            <strong>${escapeHtml(n.title)}</strong>
                            <div style="font-size:0.8rem; color:var(--adm-text-muted);">
                                ${escapeHtml(n.unit || 'General')} &middot; ${hasFile ? 'PDF file attached' : 'Formula sheet preview'}
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <select class="adm-select compact" onchange="updateSinglePdfPlan(${idx}, this.value)">
                                <option value="free" ${mp === 'free' ? 'selected' : ''}>Free</option>
                                <option value="gold" ${mp === 'gold' ? 'selected' : ''}>Gold</option>
                                <option value="diamond" ${mp === 'diamond' ? 'selected' : ''}>Diamond</option>
                            </select>
                            <button type="button" class="btn-topbar danger" style="padding:5px 10px; font-size:0.78rem;" onclick="deletePdfItem(${idx})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function selectQuestionToEdit(topicId) {
    activeQuestionId = topicId;
    renderContentTab();
}

function fillQuestionForm(topic) {
    document.getElementById('qEditId').value = topic.id || '';
    document.getElementById('qTitleInput').value = topic.title || '';
    document.getElementById('qMinPlanInput').value = (topic.minPlan || 'free').toLowerCase();
    document.getElementById('qOverviewInput').value = topic.overview || topic.content || '';
    document.getElementById('qDefsInput').value = topic.definitions || '';
    document.getElementById('qAnswerInput').value = topic.derivation || topic.example || '';
    document.getElementById('qTrapInput').value = topic.pitfalls || '';
    const delBtn = document.getElementById('btnDeleteQuestion');
    if (delBtn) delBtn.style.display = 'inline-flex';
}

function startNewQuestion(focusInput = true) {
    activeQuestionId = '__new__';
    document.getElementById('qEditId').value = '';
    document.getElementById('qTitleInput').value = '';
    document.getElementById('qMinPlanInput').value = 'free';
    document.getElementById('qOverviewInput').value = '';
    document.getElementById('qDefsInput').value = '';
    document.getElementById('qAnswerInput').value = '';
    document.getElementById('qTrapInput').value = '';
    const delBtn = document.getElementById('btnDeleteQuestion');
    if (delBtn) delBtn.style.display = 'none';
    if (focusInput) document.getElementById('qTitleInput')?.focus();
}

async function saveCurrentQuestion(e) {
    e.preventDefault();
    const portal = ADMIN_STATE?.portals?.[activeContentClass];
    if (!portal) return;

    const editId = document.getElementById('qEditId').value;
    const title = document.getElementById('qTitleInput').value.trim();
    const minPlan = document.getElementById('qMinPlanInput').value || 'free';
    const overview = document.getElementById('qOverviewInput').value.trim();
    const definitions = document.getElementById('qDefsInput').value.trim();
    const derivation = document.getElementById('qAnswerInput').value.trim();
    const pitfalls = document.getElementById('qTrapInput').value.trim();

    if (!title) return;

    const units = JSON.parse(JSON.stringify(portal.units || []));
    if (units.length === 0) {
        units.push({ code: 'UNIT 01', title: 'Core Questions', marks: '', topics: [] });
    }

    let updated = false;
    if (editId) {
        for (const u of units) {
            const idx = (u.topics || []).findIndex(t => t.id === editId);
            if (idx !== -1) {
                u.topics[idx] = {
                    ...u.topics[idx],
                    title,
                    minPlan,
                    adminAssignedPlan: true,
                    overview,
                    definitions,
                    derivation,
                    pitfalls
                };
                activeQuestionId = editId;
                updated = true;
                break;
            }
        }
    }

    if (!updated) {
        const newId = `${activeContentClass}-q-${Date.now()}`;
        units[0].topics = units[0].topics || [];
        units[0].topics.push({
            id: newId,
            title,
            readTime: '10 min read',
            minPlan,
            adminAssignedPlan: true,
            overview,
            definitions,
            derivation,
            pitfalls
        });
        activeQuestionId = newId;
    }

    await persistAcademyState({
        portals: { [activeContentClass]: { units } }
    }, 'Question saved.');
}

async function deleteCurrentQuestion() {
    const editId = document.getElementById('qEditId').value;
    const title = document.getElementById('qTitleInput').value || 'this question';
    if (!editId) return;
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const portal = ADMIN_STATE?.portals?.[activeContentClass];
    if (!portal) return;

    const units = JSON.parse(JSON.stringify(portal.units || []));
    units.forEach(u => {
        u.topics = (u.topics || []).filter(t => t.id !== editId);
    });
    activeQuestionId = '';

    await persistAcademyState({
        portals: { [activeContentClass]: { units } }
    }, 'Question deleted.');
}

async function handleAddPdf(e) {
    e.preventDefault();
    const portal = ADMIN_STATE?.portals?.[activeContentClass];
    if (!portal) return;

    const title = document.getElementById('pdfTitleInput').value.trim();
    const unit = document.getElementById('pdfUnitInput').value.trim() || 'All Units';
    const minPlan = document.getElementById('pdfMinPlanInput').value || 'free';
    const urlInput = document.getElementById('pdfUrlInput').value.trim();
    const fileInput = document.getElementById('pdfFileInput');
    if (!title) return;

    let fileUrl = urlInput;
    let fileSize = 'PDF';

    if (fileInput?.files?.[0]) {
        const file = fileInput.files[0];
        fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        fileUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const notes = JSON.parse(JSON.stringify(portal.notes || []));
    notes.unshift({
        id: `${activeContentClass}-pdf-${Date.now()}`,
        title,
        unit,
        pages: 'PDF',
        fileSize,
        minPlan,
        adminAssignedPlan: true,
        fileUrl
    });

    const ok = await persistAcademyState({
        portals: { [activeContentClass]: { notes, notesPdfs: notes } }
    }, 'PDF added and saved.');

    if (ok) {
        document.getElementById('pdfTitleInput').value = '';
        document.getElementById('pdfUnitInput').value = '';
        document.getElementById('pdfUrlInput').value = '';
        if (fileInput) fileInput.value = '';
    }
}

async function updateSinglePdfPlan(idx, newPlan) {
    const portal = ADMIN_STATE?.portals?.[activeContentClass];
    if (!portal) return;
    const notes = JSON.parse(JSON.stringify(portal.notes || []));
    if (!notes[idx]) return;
    notes[idx].minPlan = newPlan;
    notes[idx].adminAssignedPlan = true;
    await persistAcademyState({
        portals: { [activeContentClass]: { notes, notesPdfs: notes } }
    }, 'PDF plan updated.');
}

async function deletePdfItem(idx) {
    const portal = ADMIN_STATE?.portals?.[activeContentClass];
    const target = portal?.notes?.[idx];
    if (!target) return;
    if (!confirm(`Delete PDF "${target.title}"? This cannot be undone.`)) return;

    const notes = JSON.parse(JSON.stringify(portal.notes || []));
    notes.splice(idx, 1);

    await persistAcademyState({
        portals: { [activeContentClass]: { notes, notesPdfs: notes } }
    }, 'PDF deleted.');
}

/* --------------------------------------------------------------------------
   4. TAB 3: SECTION ACCESS (INDEPENDENT OPEN / LOCKED TOGGLES)
   -------------------------------------------------------------------------- */
function renderSectionAccessTab() {
    const mount = document.getElementById('sectionAccessList');
    if (!mount || !ADMIN_STATE) return;

    const locks = ADMIN_STATE.sectionLocks || {};
    mount.innerHTML = SECTION_META.map(sec => {
        const lock = locks[sec.key] || { locked: false, reason: '' };
        const isLocked = Boolean(lock.locked);
        return `
            <div class="adm-section-card ${isLocked ? 'is-locked' : 'is-open'}">
                <div class="adm-section-top">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <strong>${sec.label}</strong>
                            <span class="adm-status-pill ${isLocked ? 'locked' : 'open'}">${isLocked ? 'Locked' : 'Open'}</span>
                        </div>
                        <small style="color:var(--adm-text-muted);">${sec.sub}</small>
                    </div>
                    <button type="button" class="btn-toggle-lock ${isLocked ? 'locked' : 'open'}" onclick="toggleSectionLock('${sec.key}')">
                        ${isLocked ? 'Reopen Section' : 'Lock Section'}
                    </button>
                </div>
                <div style="margin-top:12px;">
                    <label class="adm-label" style="margin-bottom:4px;">Message shown when locked</label>
                    <div style="display:flex; gap:8px;">
                        <input type="text" class="adm-input" id="lockReason-${sec.key}" value="${escapeHtml(lock.reason || 'Temporarily unavailable')}" placeholder="Temporarily unavailable">
                        <button type="button" class="btn-topbar" onclick="saveSectionReason('${sec.key}')">Save</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function toggleSectionLock(sectionKey) {
    const current = ADMIN_STATE?.sectionLocks?.[sectionKey] || { locked: false, reason: 'Temporarily unavailable' };
    const nextLocked = !current.locked;
    const reasonInput = document.getElementById(`lockReason-${sectionKey}`)?.value.trim() || 'Temporarily unavailable';

    await persistAcademyState({
        sectionLocks: {
            [sectionKey]: {
                locked: nextLocked,
                reason: nextLocked ? reasonInput : ''
            }
        }
    }, nextLocked ? 'Section locked.' : 'Section reopened.');
}

async function saveSectionReason(sectionKey) {
    const current = ADMIN_STATE?.sectionLocks?.[sectionKey] || { locked: false, reason: '' };
    const reason = document.getElementById(`lockReason-${sectionKey}`)?.value.trim() || 'Temporarily unavailable';

    await persistAcademyState({
        sectionLocks: {
            [sectionKey]: {
                locked: Boolean(current.locked),
                reason
            }
        }
    }, 'Lock message saved.');
}

/* --------------------------------------------------------------------------
   5. TAB 4: PLANS & ACCESS (EDIT PLANS, BULK ASSIGN, STUDENT PREVIEW)
   -------------------------------------------------------------------------- */
function renderPlansTab() {
    renderPlanSettingsEditor();
    renderPlanAccessTable();
    renderPlanStudentPreview();
}

function renderPlanSettingsEditor() {
    const mount = document.getElementById('planSettingsGrid');
    if (!mount || !ADMIN_STATE) return;

    const plans = ADMIN_STATE.plansConfig || {};
    const tiers = ['free', 'gold', 'diamond'];

    mount.innerHTML = tiers.map(pid => {
        const p = plans[pid] || { name: pid, price: '', period: '', description: '' };
        return `
            <div class="adm-plan-editor-card">
                <div class="adm-box-label" style="text-transform:uppercase;">${pid} tier</div>
                <div style="margin-bottom:10px;">
                    <label class="adm-label">Plan Name</label>
                    <input type="text" class="adm-input" id="planName-${pid}" value="${escapeHtml(p.name || pid)}">
                </div>
                <div class="adm-form-row-2" style="margin-bottom:10px;">
                    <div>
                        <label class="adm-label">Price</label>
                        <input type="text" class="adm-input" id="planPrice-${pid}" value="${escapeHtml(p.price || '')}">
                    </div>
                    <div>
                        <label class="adm-label">Period</label>
                        <input type="text" class="adm-input" id="planPeriod-${pid}" value="${escapeHtml(p.period || '')}">
                    </div>
                </div>
                <div>
                    <label class="adm-label">Description</label>
                    <textarea class="adm-textarea" rows="2" id="planDesc-${pid}">${escapeHtml(p.description || '')}</textarea>
                </div>
            </div>
        `;
    }).join('');
}

async function savePlanSettings() {
    const plansConfig = {};
    ['free', 'gold', 'diamond'].forEach(pid => {
        plansConfig[pid] = {
            id: pid,
            name: (document.getElementById(`planName-${pid}`)?.value || pid).trim(),
            price: (document.getElementById(`planPrice-${pid}`)?.value || '').trim(),
            period: (document.getElementById(`planPeriod-${pid}`)?.value || '').trim(),
            description: (document.getElementById(`planDesc-${pid}`)?.value || '').trim()
        };
    });

    await persistAcademyState({ plansConfig }, 'Plan details saved.');
}

function collectAllContentItems() {
    const items = [];
    SECTION_META.forEach(sec => {
        const portal = ADMIN_STATE?.portals?.[sec.key];
        if (!portal) return;

        (portal.units || []).forEach((u, uIdx) => {
            (u.topics || []).forEach((t, tIdx) => {
                items.push({
                    compositeKey: `${sec.key}|question|${t.id}`,
                    classKey: sec.key,
                    sectionLabel: sec.label,
                    type: 'question',
                    typeLabel: 'Question',
                    id: t.id,
                    title: t.title || 'Untitled Question',
                    minPlan: (t.minPlan || 'free').toLowerCase(),
                    unitIdx: uIdx,
                    topicIdx: tIdx
                });
            });
        });

        (portal.notes || []).forEach((n, nIdx) => {
            const nid = n.id || String(nIdx);
            items.push({
                compositeKey: `${sec.key}|pdf|${nid}`,
                classKey: sec.key,
                sectionLabel: sec.label,
                type: 'pdf',
                typeLabel: 'PDF',
                id: nid,
                title: n.title || 'Untitled PDF',
                minPlan: (n.minPlan || 'free').toLowerCase(),
                noteIdx: nIdx
            });
        });
    });
    return items;
}

function renderPlanAccessTable() {
    const tbody = document.getElementById('planAccessTableBody');
    if (!tbody || !ADMIN_STATE) return;

    const filterClass = document.getElementById('planFilterClass')?.value || 'all';
    const filterType = document.getElementById('planFilterType')?.value || 'all';

    const items = collectAllContentItems().filter(it => {
        if (filterClass !== 'all' && it.classKey !== filterClass) return false;
        if (filterType !== 'all' && it.type !== filterType) return false;
        return true;
    });

    const countEl = document.getElementById('bulkSelectedCount');
    if (countEl) countEl.textContent = `${selectedPlanItemKeys.size} selected`;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--adm-text-muted);">No items match this filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(it => {
        const checked = selectedPlanItemKeys.has(it.compositeKey) ? 'checked' : '';
        const escKey = escapeHtml(it.compositeKey);
        return `
            <tr>
                <td><input type="checkbox" ${checked} onchange="togglePlanItemSelection('${escKey}', this.checked)"></td>
                <td>${escapeHtml(it.sectionLabel)}</td>
                <td><span class="adm-type-pill">${it.typeLabel}</span></td>
                <td><strong>${escapeHtml(it.title)}</strong></td>
                <td>
                    <select class="adm-select compact" onchange="assignSingleContentPlan('${escKey}', this.value)">
                        <option value="free" ${it.minPlan === 'free' ? 'selected' : ''}>Free</option>
                        <option value="gold" ${it.minPlan === 'gold' ? 'selected' : ''}>Gold</option>
                        <option value="diamond" ${it.minPlan === 'diamond' ? 'selected' : ''}>Diamond</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function togglePlanItemSelection(compositeKey, isChecked) {
    if (isChecked) selectedPlanItemKeys.add(compositeKey);
    else selectedPlanItemKeys.delete(compositeKey);
    const countEl = document.getElementById('bulkSelectedCount');
    if (countEl) countEl.textContent = `${selectedPlanItemKeys.size} selected`;
}

function toggleSelectAllPlanItems(isChecked) {
    const filterClass = document.getElementById('planFilterClass')?.value || 'all';
    const filterType = document.getElementById('planFilterType')?.value || 'all';
    const visible = collectAllContentItems().filter(it => {
        if (filterClass !== 'all' && it.classKey !== filterClass) return false;
        if (filterType !== 'all' && it.type !== filterType) return false;
        return true;
    });

    visible.forEach(it => {
        if (isChecked) selectedPlanItemKeys.add(it.compositeKey);
        else selectedPlanItemKeys.delete(it.compositeKey);
    });
    renderPlanAccessTable();
}

async function assignSingleContentPlan(compositeKey, newPlan) {
    await applyPlanKeysUpdate([compositeKey], newPlan);
}

async function applyBulkPlanAssignment() {
    if (selectedPlanItemKeys.size === 0) {
        showAdminToast('Select at least one item first.', 'error');
        return;
    }
    const targetPlan = document.getElementById('bulkPlanSelect')?.value || 'free';
    const keys = Array.from(selectedPlanItemKeys);
    const ok = await applyPlanKeysUpdate(keys, targetPlan);
    if (ok) {
        selectedPlanItemKeys.clear();
        const selectAll = document.getElementById('bulkSelectAll');
        if (selectAll) selectAll.checked = false;
        renderPlanAccessTable();
    }
}

async function applyPlanKeysUpdate(compositeKeys, newPlan) {
    const portalsPatch = {};
    const touchedClasses = new Set();

    compositeKeys.forEach(k => {
        const [classKey] = k.split('|');
        touchedClasses.add(classKey);
    });

    touchedClasses.forEach(ck => {
        const existing = ADMIN_STATE?.portals?.[ck];
        if (!existing) return;
        portalsPatch[ck] = {
            units: JSON.parse(JSON.stringify(existing.units || [])),
            notes: JSON.parse(JSON.stringify(existing.notes || []))
        };
    });

    compositeKeys.forEach(k => {
        const [classKey, type, itemId] = k.split('|');
        const patch = portalsPatch[classKey];
        if (!patch) return;

        if (type === 'question') {
            patch.units.forEach(u => {
                (u.topics || []).forEach(t => {
                    if (String(t.id) === itemId) {
                        t.minPlan = newPlan;
                        t.adminAssignedPlan = true;
                    }
                });
            });
        } else if (type === 'pdf') {
            patch.notes.forEach((n, idx) => {
                if (String(n.id || idx) === itemId) {
                    n.minPlan = newPlan;
                    n.adminAssignedPlan = true;
                }
            });
            patch.notesPdfs = patch.notes;
        }
    });

    return await persistAcademyState({ portals: portalsPatch }, `Assigned ${compositeKeys.length} item(s) to ${newPlan.toUpperCase()}.`);
}

function setPlanPreviewTier(tier) {
    activePreviewTier = tier;
    ['free', 'gold', 'diamond'].forEach(t => {
        document.getElementById(`previewBtn-${t}`)?.classList.toggle('active-preview', t === tier);
    });
    renderPlanStudentPreview();
}

function renderPlanStudentPreview() {
    const mount = document.getElementById('planStudentPreviewMount');
    if (!mount || !ADMIN_STATE) return;

    const rank = { free: 0, gold: 1, diamond: 2 };
    const tierRank = rank[activePreviewTier] || 0;
    const planName = ADMIN_STATE.plansConfig?.[activePreviewTier]?.name || activePreviewTier;

    mount.innerHTML = `
        <div class="adm-preview-grid">
            ${SECTION_META.map(sec => {
                const locked = Boolean(ADMIN_STATE.sectionLocks?.[sec.key]?.locked);
                const portal = ADMIN_STATE.portals?.[sec.key] || {};
                const allQs = getAllQuestionsInPortal(portal);
                const allPdfs = portal.notes || [];

                if (locked) {
                    return `
                        <div class="adm-preview-card is-locked">
                            <div class="adm-preview-head">
                                <strong>${sec.label}</strong>
                                <span class="adm-status-pill locked">Section Locked</span>
                            </div>
                            <p style="font-size:0.84rem; color:var(--adm-text-muted); margin:8px 0 0;">
                                Temporarily unavailable on all plans (including ${escapeHtml(planName)}).
                            </p>
                        </div>
                    `;
                }

                const openQs = allQs.filter(({ topic }) => tierRank >= (rank[topic.minPlan || 'free'] || 0));
                const openPdfs = allPdfs.filter(n => tierRank >= (rank[n.minPlan || 'free'] || 0));

                return `
                    <div class="adm-preview-card">
                        <div class="adm-preview-head">
                            <strong>${sec.label}</strong>
                            <span class="adm-status-pill open">${openQs.length}/${allQs.length} Questions &middot; ${openPdfs.length}/${allPdfs.length} PDFs</span>
                        </div>
                        <ul class="adm-preview-list">
                            ${openQs.map(({ topic }) => `<li>Question: ${escapeHtml(topic.title)}</li>`).join('')}
                            ${openPdfs.map(n => `<li>PDF: ${escapeHtml(n.title)}</li>`).join('')}
                            ${openQs.length === 0 && openPdfs.length === 0 ? '<li style="color:var(--adm-text-muted);">No items unlocked on this plan yet.</li>' : ''}
                        </ul>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/* --------------------------------------------------------------------------
   6. BOOT
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pass') === ADMIN_PASSKEY || sessionStorage.getItem(ADMIN_AUTH_KEY) === '1') {
        sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
        openAdminShell();
    }
});
