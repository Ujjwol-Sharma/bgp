/* BPG Academy — Dedicated Single-Class Portal Renderer (js/portal-renderer.js) */

/* --------------------------------------------------------------------------
   1. STUDENT PORTAL RENDERER (CLASS 10, CLASS 11, CLASS 12 & AFTER 12)
   -------------------------------------------------------------------------- */
function renderEntireStudentPortal() {
    const heroImg = document.getElementById('heroPortraitImg');
    if (heroImg && ACADEMY_STATE.faculty?.portraitUrl) {
        heroImg.src = ACADEMY_STATE.faculty.portraitUrl;
    }

    document.querySelectorAll('[data-field]').forEach(el => {
        const path = el.getAttribute('data-field');
        const val = getByPath(ACADEMY_STATE, path);
        if (val !== undefined && val !== '') {
            el.innerHTML = val;
        }
    });

    renderAnnouncementsDrawer();

    const shortMap = {
        'class-10': 'c10',
        'class-11': 'c11',
        'class-12': 'c12',
        'after-12': 'entrance'
    };

    ['class-10', 'class-11', 'class-12', 'after-12'].forEach(classKey => {
        const pData = ACADEMY_STATE.portals?.[classKey];
        if (!pData) return;
        const totals = computeSyllabusTotals(pData.syllabusRows);
        const shortPrefix = shortMap[classKey] || 'c11';

        // Dynamic Sync: Homepage Program Cards
        const homeThumb = document.getElementById(`homeCardThumb-${classKey}`);
        if (homeThumb && pData.thumbUrl) homeThumb.src = pData.thumbUrl;
        const homeTitle = document.getElementById(`homeCardTitle-${classKey}`);
        if (homeTitle && pData.gradeTitle) homeTitle.textContent = pData.gradeTitle;
        const homeDesc = document.getElementById(`homeCardDesc-${classKey}`);
        if (homeDesc && pData.description) homeDesc.textContent = pData.description;

        // Dynamic Sync: Course Workspace Hero Banner
        const heroThumb = document.getElementById(`heroThumb-${classKey}`);
        if (heroThumb && pData.thumbUrl) heroThumb.src = pData.thumbUrl;
        const heroTitle = document.getElementById(`heroTitle-${classKey}`);
        if (heroTitle && pData.gradeTitle) heroTitle.textContent = pData.gradeTitle;
        const heroDesc = document.getElementById(`heroDesc-${classKey}`);
        if (heroDesc && pData.description) heroDesc.textContent = pData.description;
        const heroLessons = document.getElementById(`heroLessons-${classKey}`);
        if (heroLessons && pData.metaLessons) heroLessons.innerHTML = `<i class="fa-solid fa-video"></i> ${escapeHtml(pData.metaLessons)}`;
        const heroNotes = document.getElementById(`heroNotes-${classKey}`);
        if (heroNotes && pData.metaNotes) heroNotes.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${escapeHtml(pData.metaNotes)}`;
        const heroLive = document.getElementById(`heroLive-${classKey}`);
        if (heroLive && pData.metaLive) heroLive.innerHTML = `<i class="fa-solid fa-tower-broadcast"></i> ${escapeHtml(pData.metaLive)}`;

        // Check if this section is temporarily locked (applies to every plan including Diamond)
        const lockInfo = typeof getSectionLockInfo === 'function'
            ? getSectionLockInfo(classKey)
            : { locked: false, reason: '' };

        if (lockInfo.locked) {
            const lockedBannerHtml = `
                <div class="section-locked-inline-card">
                    <span class="section-status-badge locked">Locked</span>
                    <h3>${pData.gradeTitle || classKey}</h3>
                    <p>${lockInfo.reason || 'Temporarily unavailable'}. This section is closed across all plans until reopened by the academy.</p>
                </div>
            `;
            const sylBoxL = document.getElementById(`syllabusContainer-${classKey}`);
            if (sylBoxL) sylBoxL.innerHTML = lockedBannerHtml;
            const sideL = document.getElementById(`readerSidebar-${classKey}`);
            if (sideL) sideL.innerHTML = '';
            const canvL = document.getElementById(`readerCanvas-${classKey}`);
            if (canvL) canvL.innerHTML = lockedBannerHtml;
            const calL = document.getElementById(`calendarContainer-${classKey}`);
            if (calL) calL.innerHTML = lockedBannerHtml;
            const notesL = document.getElementById(`notesContainer-${classKey}`);
            if (notesL) notesL.innerHTML = lockedBannerHtml;
            return;
        }

        // TAB 1: SYLLABUS BLUEPRINT SPECIFICATION GRID
        const sylBox = document.getElementById(`syllabusContainer-${classKey}`);
        if (sylBox) {
            sylBox.innerHTML = `
                <div class="syllabus-card-wrap">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
                        <div>
                            <span class="calm-unit-pill">${pData.curriculumHeader || 'Official Specification Grid'}</span>
                            <h3 style="font-size:1.3rem; margin-top:6px;">${pData.gradeTitle}</h3>
                        </div>
                        <button class="btn-calm-secondary sm" onclick="switchClassTab('${shortPrefix}', 'units', document.getElementById('tab-${shortPrefix}-units'))">
                            <span>Open Units &amp; Theory</span> <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table class="syllabus-table">
                            <thead>
                                <tr>
                                    <th>Unit Code</th>
                                    <th>Unit / Domain</th>
                                    <th>Teaching Hours</th>
                                    <th>Board / Exam Marks</th>
                                    <th>Exam Weightage Pattern</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(pData.syllabusRows || []).map(r => `
                                    <tr>
                                        <td><strong style="color:var(--accent-navy);">${r.code}</strong></td>
                                        <td><strong style="color:var(--text-primary);">${r.name || r.domain || ''}</strong></td>
                                        <td><span>${r.hours}</span></td>
                                        <td><span class="calm-unit-pill">${r.marks}</span></td>
                                        <td><span>${r.focus || r.weightage || ''}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="syllabus-tfoot-row">
                                    <td colspan="2">Total Official Curriculum Blueprint (${(pData.syllabusRows || []).length} Domains)</td>
                                    <td>${totals.totalHours} hrs</td>
                                    <td><span class="calm-unit-pill">${totals.totalMarks} Marks</span></td>
                                    <td>${classKey === 'after-12' ? 'IOE Pulchowk CBT (-0.25 Negative Marking)' : 'NEB CDC Board Specification'}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
        }

        // TAB 2: UNITS & THEORY SIDEBAR + KATEX READER
        renderUnitsTree(classKey, '');
        const activeId = currentActiveTopic[classKey] || pData.units[0]?.topics[0]?.id;
        if (activeId) {
            selectDeepSubtopic(classKey, activeId);
        }

        // TAB 3: LIVE CLASS CALENDAR
        renderPortalCalendar(classKey);

        // TAB 4: NOTES & PDFS (Plan-gated with server verification)
        const notesBox = document.getElementById(`notesContainer-${classKey}`);
        if (notesBox) {
            const activeNotes = getNormalizedPortalNotes(classKey);
            notesBox.innerHTML = `
                <div class="notes-vault-grid">
                    ${activeNotes.map((n, nIdx) => {
                        const minPlan = (n.minPlan || 'free').toLowerCase();
                        const planName = typeof formatPlanLabel === 'function' ? formatPlanLabel(minPlan) : minPlan;
                        const isRestricted = Boolean(n.restricted);
                        const noteId = escapeHtml(n.id || String(nIdx));
                        return `
                        <div class="note-pdf-card ${isRestricted ? 'is-restricted-item' : ''}">
                            <div class="note-pdf-left">
                                <div class="pdf-icon-box">
                                    <i class="fa-solid ${isRestricted ? 'fa-lock' : 'fa-file-pdf'}"></i>
                                </div>
                                <div>
                                    <span class="note-badge-pill plan-badge-${minPlan}">
                                        ${isRestricted ? `<i class="fa-solid fa-lock" style="margin-right:4px;"></i> ${planName} Plan` : `${planName} Plan &middot; Unlocked`}
                                    </span>
                                    <h4 style="font-size:0.98rem; margin-bottom:2px;">${n.title}</h4>
                                    <small style="color:var(--text-tertiary);">
                                        <span>${n.unit || 'All Units'}</span> &bull;
                                        <span>${n.pages || 'PDF'}</span> &bull;
                                        <span>${n.fileSize || '2.5 MB'}</span>
                                    </small>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                <button class="btn-calm-secondary sm" onclick="openPdfViewerModal(${nIdx}, '${classKey}', '${noteId}')">
                                    <i class="fa-regular ${isRestricted ? 'fa-eye-slash' : 'fa-eye'}"></i> <span>${isRestricted ? 'Unlock & View' : 'View'}</span>
                                </button>
                                <button class="btn-calm-secondary sm" onclick="downloadNoteFormulaSheet(${nIdx}, '${classKey}', '${noteId}')" title="Download Resource">
                                    <i class="fa-solid fa-download"></i> <span>Download</span>
                                </button>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    });

    // Auto-render KaTeX math formulas
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    }
}

/* --------------------------------------------------------------------------
   2. MASTER-DETAIL UNITS & THEORY READER
   -------------------------------------------------------------------------- */
function renderUnitsTree(classKey, filterQuery) {
    const sidebar = document.getElementById(`readerSidebar-${classKey}`);
    if (!sidebar) return;

    const q = (filterQuery || '').trim().toLowerCase();
    const units = ACADEMY_STATE.portals[classKey]?.units || [];

    sidebar.innerHTML = units.map((u, uIdx) => {
        const matched = (u.topics || []).filter(t => {
            if (!q) return true;
            const hay = [t.title, u.title, t.overview, t.content, t.definitions].filter(Boolean).join(' ').toLowerCase();
            return hay.includes(q);
        });
        if (q && matched.length === 0) return '';

        return `
            <div class="unit-tree-group ${uIdx === 0 || q ? 'open' : ''}">
                <button class="unit-tree-header" onclick="this.parentElement.classList.toggle('open')">
                    <div>
                        <span class="unit-tree-code">${u.code || ''}</span>
                        <span>${u.title || ''}</span>
                    </div>
                    <span style="font-size:0.72rem; color:var(--text-tertiary);">${u.marks || ''}</span>
                </button>
                <div class="unit-subtopics-list">
                    ${matched.map(t => {
                        const mp = (t.minPlan || 'free').toLowerCase();
                        const mpLabel = typeof formatPlanLabel === 'function' ? formatPlanLabel(mp) : mp;
                        const locked = Boolean(t.restricted);
                        return `
                        <button class="subtopic-item-btn ${currentActiveTopic[classKey] === t.id ? 'active' : ''} ${locked ? 'is-restricted-item' : ''}" id="btn-${t.id}" onclick="selectDeepSubtopic('${classKey}', '${t.id}')">
                            <span class="subtopic-item-title">
                                ${locked ? '<i class="fa-solid fa-lock" style="font-size:0.72rem; margin-right:6px; opacity:0.7;"></i>' : ''}${t.title || 'Untitled Topic'}
                            </span>
                            <div class="subtopic-item-meta">
                                <span>${t.readTime || '14 min'}</span>
                                <span class="plan-mini-pill plan-badge-${mp}">${mpLabel}</span>
                            </div>
                        </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderLevelUpCard(containerEl, requiredPlan, itemTitle) {
    const safeTitle = escapeHtml(itemTitle || 'this content');
    const planLabel = typeof formatPlanLabel === 'function' ? formatPlanLabel(requiredPlan) : requiredPlan;
    containerEl.innerHTML = `
        <div class="level-up-gate-card">
            <div class="level-up-icon"><i class="fa-solid fa-lock"></i></div>
            <h3>Level up to unlock this content</h3>
            <p><strong>${safeTitle}</strong> requires the <strong>${escapeHtml(planLabel)}</strong> plan or higher.</p>
            <button type="button" class="btn btn-primary" onclick="openPlanComparisonModal('${escapeHtml(requiredPlan)}', '${safeTitle.replace(/'/g, "\\'")}')">
                View plans
            </button>
        </div>
    `;
}

async function selectDeepSubtopic(classKey, topicId) {
    const units = ACADEMY_STATE.portals[classKey]?.units || [];
    let foundUnit = null, foundTopic = null;

    for (let i = 0; i < units.length; i++) {
        const j = (units[i].topics || []).findIndex(item => item.id === topicId);
        if (j !== -1) {
            foundUnit = units[i];
            foundTopic = units[i].topics[j];
            break;
        }
    }
    if (!foundTopic && units[0]?.topics?.[0]) {
        foundUnit = units[0];
        foundTopic = units[0].topics[0];
    }
    if (!foundTopic) return;

    currentActiveTopic[classKey] = foundTopic.id;

    const sidebar = document.getElementById(`readerSidebar-${classKey}`);
    sidebar?.querySelectorAll('.subtopic-item-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${foundTopic.id}`)?.classList.add('active');

    const canvas = document.getElementById(`readerCanvas-${classKey}`);
    if (!canvas) return;

    // Server-side access verification before displaying full questions & answers
    let verifiedTopic = foundTopic;
    let verifiedUnit = foundUnit;
    try {
        const authHeaders = typeof getStudentAuthHeaders === 'function' ? getStudentAuthHeaders() : {};
        const url = `/api/content-access?classKey=${encodeURIComponent(classKey)}&itemType=topic&itemId=${encodeURIComponent(foundTopic.id)}&_t=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store', headers: authHeaders });
        const payload = await res.json();

        if (res.status === 403 && payload.code === 'SECTION_LOCKED') {
            canvas.innerHTML = `
                <div class="section-locked-inline-card">
                    <span class="section-status-badge locked">Locked</span>
                    <h3>Temporarily unavailable</h3>
                    <p>${escapeHtml(payload.error || 'This section is temporarily unavailable.')}</p>
                </div>
            `;
            return;
        }

        if (res.status === 403 && payload.code === 'PLAN_REQUIRED') {
            renderLevelUpCard(canvas, payload.requiredPlan || foundTopic.minPlan || 'gold', payload.itemTitle || foundTopic.title);
            return;
        }

        if (res.ok && payload.ok && payload.item) {
            verifiedTopic = payload.item;
            verifiedUnit = payload.unit || foundUnit;
        }
    } catch (e) {
        if (foundTopic.restricted) {
            renderLevelUpCard(canvas, foundTopic.minPlan || 'gold', foundTopic.title);
            return;
        }
    }

    const hasStructuredFields = Boolean(verifiedTopic.overview || verifiedTopic.definitions || verifiedTopic.derivation || verifiedTopic.example || verifiedTopic.pitfalls);
    const diagramBlock = verifiedTopic.diagramUrl
        ? `<div class="reader-section-block" style="text-align:center; margin:18px 0;">
               <img src="${verifiedTopic.diagramUrl}" alt="${escapeHtml(verifiedTopic.title || 'Mathematical Diagram')}" style="max-width:100%; max-height:360px; border-radius:10px; border:1px solid var(--border-soft); margin:0 auto;">
           </div>`
        : '';

    const proseHtml = hasStructuredFields ? `
        <div class="textbook-prose">
            ${diagramBlock}
            ${verifiedTopic.overview ? `
            <div class="reader-section-block">
                <h3>1. Conceptual Overview &amp; Question</h3>
                <p>${formatRichMarkdown(verifiedTopic.overview)}</p>
            </div>` : ''}

            ${verifiedTopic.definitions ? `
            <div class="reader-section-block">
                <h3>2. Formal Mathematical Definitions &amp; Formulas</h3>
                <div class="math-theorem-box">
                    ${verifiedTopic.definitions}
                </div>
            </div>` : ''}

            ${verifiedTopic.derivation ? `
            <div class="reader-section-block">
                <h3>3. Step-by-Step Proof &amp; Solution</h3>
                <div class="derivation-step-flow">
                    ${formatRichMarkdown(verifiedTopic.derivation)}
                </div>
            </div>` : ''}

            ${verifiedTopic.example ? `
            <div class="reader-section-block">
                <h3>4. Solved Examination Problem</h3>
                <div class="example-box">
                    ${formatRichMarkdown(verifiedTopic.example)}
                </div>
            </div>` : ''}

            ${verifiedTopic.pitfalls ? `
            <div class="callout-trap red-pen-alert">
                <strong><i class="fa-solid fa-pen-fancy"></i> Examiner Trap:</strong>
                <p style="margin-top:4px;">${formatRichMarkdown(verifiedTopic.pitfalls)}</p>
            </div>` : ''}
        </div>
    ` : `
        <div class="textbook-prose">
            ${diagramBlock}
            <div class="reader-section-block">
                ${formatRichMarkdown(verifiedTopic.content || '')}
            </div>
        </div>
    `;

    canvas.innerHTML = `
        <article class="deep-topic-article">
            <header class="deep-topic-header">
                <span class="unit-code-badge">${verifiedUnit?.code || 'Unit'}: ${verifiedUnit?.title || ''}</span>
                <h2>${verifiedTopic.title}</h2>
                <div class="deep-topic-meta">
                    <span><i class="fa-regular fa-clock"></i> ${verifiedTopic.readTime || '14 min read'}</span>
                    <span><i class="fa-solid fa-award"></i> ${verifiedUnit?.marks || 'Core Topic'}</span>
                    <span>${typeof formatPlanLabel === 'function' ? formatPlanLabel(verifiedTopic.minPlan || 'free') : (verifiedTopic.minPlan || 'Free')} Plan</span>
                </div>
            </header>
            <div class="deep-topic-body" id="topicBodyContent">
                ${proseHtml}
            </div>
        </article>
    `;

    renderMathSafely(canvas);
}

/* --------------------------------------------------------------------------
   3. LIVE CLASS CALENDAR RENDERER
   -------------------------------------------------------------------------- */
function renderPortalCalendar(classKey) {
    const calMount = document.getElementById(`calendarContainer-${classKey}`);
    if (!calMount) return;

    const allEvents = Array.isArray(ACADEMY_STATE.calendarEvents)
        ? ACADEMY_STATE.calendarEvents
        : DEFAULT_PUBLIC_DATA.calendarEvents;
    const events = allEvents.filter(ev => ev.portal === classKey || ev.portal === 'all');

    calMount.innerHTML = `
        <div class="calendar-card-wrap">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <div>
                    <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin:0;">Live Zoom Interactive Classes</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:3px;">
                        Interactive problem-solving, live proof evaluations, and doubt resolution with BPG Sir.
                    </p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px;">
                ${events.map(ev => `
                    <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; gap:14px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <span style="font-size:0.75rem; font-weight:500; padding:3px 9px; border-radius:4px; background:var(--bg-elevated); color:var(--text-primary); border:1px solid var(--border-strong);">
                                    Live Zoom
                                </span>
                                <span style="font-size:0.8rem; color:var(--text-tertiary);">${ev.recurrenceLabel || 'Weekly'}</span>
                            </div>
                            <h4 style="font-size:1.05rem; font-weight:600; color:var(--text-primary); margin-bottom:8px;">${ev.title}</h4>
                            <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:6px;">
                                <span><strong style="color:var(--text-primary);">Timing:</strong> ${ev.timings || '06:30 AM – 07:45 AM NPT'}</span>
                                <span><strong style="color:var(--text-primary);">Meeting ID:</strong> <code>${ev.meetingId}</code> &middot; <strong style="color:var(--text-primary);">Passcode:</strong> <code>${ev.passcode}</code></span>
                                ${ev.syllabus ? `<p style="margin-top:6px; font-size:0.82rem; color:var(--text-tertiary); line-height:1.5;">${ev.syllabus}</p>` : ''}
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; border-top:1px solid var(--border-soft); padding-top:14px; margin-top:4px;">
                            <a href="${ev.zoomUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="flex:1; justify-content:center; text-decoration:none; padding:9px 14px; font-size:0.85rem;">
                                Join Zoom
                            </a>
                            <button type="button" class="btn btn-secondary" onclick="downloadSampleIcs('${ev.title}', '${ev.timings}')" title="Add to Calendar (.ics)" style="padding:9px 12px; font-size:0.85rem;">
                                <i class="fa-solid fa-calendar-plus"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/* --------------------------------------------------------------------------
   4. IN-APP PDF VIEWER & FORMULA SHEET GENERATOR
   -------------------------------------------------------------------------- */
function generateFormulaSheetBlobUrl(note, classKey) {
    const pData = ACADEMY_STATE.portals[classKey];
    const unitsSummary = (pData?.units || []).map(u => {
        const topDesc = (u.topics || []).map(t => `  * ${t.title}`).join('\n');
        return `[${u.code}: ${u.title}] (${u.marks})\n${topDesc}`;
    }).join('\n\n');

    const content = `============================================================
BPG ACADEMY — OFFICIAL STUDY HANDOUT & FORMULA SHEET
Faculty Lead: Bishnu Prasad Gautam (BPG Sir)
Postgraduate Distinction, Central Department of Mathematics, TU
============================================================

Title: ${note.title}
Program: ${pData?.gradeTitle || 'BPG Academy'}
Scope: ${note.unit} | ${note.pages} | ${note.fileSize || '2.5 MB'}
Core Motto: "Focus on the Concepts Rather Than the Problems."

------------------------------------------------------------
OFFICIAL SPECIFICATIONS & THEOREMS:
${unitsSummary}
============================================================
© 2026 BPG Academy. All Rights Reserved.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    return URL.createObjectURL(blob);
}

async function openPdfViewerModal(nIdx, classKey, explicitNoteId) {
    const notes = getNormalizedPortalNotes(classKey);
    const localNote = notes[nIdx];
    const noteId = explicitNoteId || localNote?.id || String(nIdx);

    const authHeaders = typeof getStudentAuthHeaders === 'function' ? getStudentAuthHeaders() : {};
    let verifiedNote = localNote;
    let downloadSummary = '';

    try {
        const res = await fetch(`/api/content-access?classKey=${encodeURIComponent(classKey)}&itemType=note&itemId=${encodeURIComponent(noteId)}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: authHeaders
        });
        const payload = await res.json();

        if (res.status === 403 && payload.code === 'SECTION_LOCKED') {
            if (typeof showSectionLockedModal === 'function') showSectionLockedModal(classKey);
            return;
        }

        if (res.status === 403 && payload.code === 'PLAN_REQUIRED') {
            // Show "Level up to unlock this content" + "View plans" inside PDF modal
            const reqPlan = payload.requiredPlan || localNote?.minPlan || 'gold';
            const title = payload.itemTitle || localNote?.title || 'This PDF';
            document.getElementById('pdfModalBadge').textContent = `${typeof formatPlanLabel === 'function' ? formatPlanLabel(reqPlan) : reqPlan} Plan Required`;
            document.getElementById('pdfModalTitle').textContent = title;
            document.getElementById('pdfModalMeta').textContent = 'Upgrade your plan to view or download this PDF.';
            const bodyEl = document.getElementById('pdfModalBody');
            renderLevelUpCard(bodyEl, reqPlan, title);
            const dlBtn = document.getElementById('pdfModalDownloadBtn');
            if (dlBtn) dlBtn.style.display = 'none';
            document.getElementById('pdfViewerModal')?.classList.add('open');
            return;
        }

        if (res.ok && payload.ok && payload.item) {
            verifiedNote = payload.item;
            downloadSummary = payload.downloadSummary || '';
        }
    } catch (e) {
        if (localNote?.restricted) {
            openPlanComparisonModal(localNote.minPlan || 'gold', localNote.title);
            return;
        }
    }

    if (!verifiedNote) return;
    const pData = ACADEMY_STATE.portals[classKey];

    document.getElementById('pdfModalBadge').textContent = `${typeof formatPlanLabel === 'function' ? formatPlanLabel(verifiedNote.minPlan || 'free') : 'Unlocked'} Plan`;
    document.getElementById('pdfModalTitle').textContent = verifiedNote.title;
    document.getElementById('pdfModalMeta').textContent = `${verifiedNote.unit || 'All Units'} • ${verifiedNote.pages || 'PDF'} • ${verifiedNote.fileSize || '2.5 MB'}`;

    const bodyEl = document.getElementById('pdfModalBody');
    const fileHref = verifiedNote.fileUrl || verifiedNote.url || '';
    if (fileHref && fileHref !== '#' && (fileHref.startsWith('data:application/pdf') || fileHref.startsWith('http') || fileHref.endsWith('.pdf'))) {
        bodyEl.innerHTML = `<iframe src="${fileHref}" style="width:100%; height:440px; border:none; border-radius:8px;"></iframe>`;
    } else {
        const sampleTopics = (pData?.units || []).slice(0, 3).map(u => {
            const firstT = (u.topics || []).find(t => !t.restricted);
            return firstT ? `
                <div style="margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--border-soft);">
                    <strong style="color:var(--accent-navy); font-size:0.84rem;">${u.code || ''}: ${u.title || ''} (${u.marks || ''})</strong>
                    <h4 style="margin:4px 0 8px; font-size:1.02rem;">${firstT.title || ''}</h4>
                    <div class="math-theorem-box" style="margin:8px 0; padding:12px 16px;">${firstT.definitions || formatRichMarkdown(firstT.content || firstT.overview || '')}</div>
                </div>
            ` : '';
        }).join('');

        bodyEl.innerHTML = `
            <div style="margin-bottom:14px; padding:12px 16px; background:var(--bg-elevated); border-radius:8px; border-left:3px solid var(--accent-navy);">
                <strong>BPG Academy — Verified Resource Preview</strong>
                <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:4px;">
                    Review key theorems below or click <strong>Download</strong> to save an offline copy.
                </p>
            </div>
            ${sampleTopics || `<pre style="white-space:pre-wrap; font-size:0.85rem;">${escapeHtml(downloadSummary)}</pre>`}
        `;
        renderMathSafely(bodyEl);
    }

    const dlBtn = document.getElementById('pdfModalDownloadBtn');
    if (dlBtn) {
        dlBtn.style.display = 'inline-flex';
        if (fileHref && fileHref !== '#') {
            dlBtn.href = fileHref;
        } else {
            dlBtn.href = downloadSummary
                ? URL.createObjectURL(new Blob([downloadSummary], { type: 'text/plain;charset=utf-8' }))
                : generateFormulaSheetBlobUrl(verifiedNote, classKey);
        }
        const safeName = verifiedNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + (fileHref ? '.pdf' : '-formula-sheet.txt');
        dlBtn.setAttribute('download', safeName);
    }

    document.getElementById('pdfViewerModal')?.classList.add('open');
}

function closePdfViewerModal() {
    document.getElementById('pdfViewerModal')?.classList.remove('open');
}

async function downloadNoteFormulaSheet(nIdx, classKey, explicitNoteId) {
    const notes = getNormalizedPortalNotes(classKey);
    const localNote = notes[nIdx];
    const noteId = explicitNoteId || localNote?.id || String(nIdx);

    const authHeaders = typeof getStudentAuthHeaders === 'function' ? getStudentAuthHeaders() : {};
    try {
        const res = await fetch(`/api/content-access?classKey=${encodeURIComponent(classKey)}&itemType=note&itemId=${encodeURIComponent(noteId)}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: authHeaders
        });
        const payload = await res.json();

        if (res.status === 403 && payload.code === 'SECTION_LOCKED') {
            if (typeof showSectionLockedModal === 'function') showSectionLockedModal(classKey);
            return;
        }
        if (res.status === 403 && payload.code === 'PLAN_REQUIRED') {
            openPdfViewerModal(nIdx, classKey, noteId);
            return;
        }
        if (!res.ok || !payload.ok || !payload.item) {
            showToast(payload.error || 'Could not download resource.');
            return;
        }

        const verifiedNote = payload.item;
        const fileHref = verifiedNote.fileUrl || verifiedNote.url || '';
        const url = fileHref && fileHref !== '#'
            ? fileHref
            : URL.createObjectURL(new Blob([payload.downloadSummary || ''], { type: 'text/plain;charset=utf-8' }));

        const a = document.createElement('a');
        a.href = url;
        a.download = verifiedNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + (fileHref ? '.pdf' : '-formula-sheet.txt');
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast(`Downloading "${verifiedNote.title}"...`);
    } catch (e) {
        showToast('Unable to verify download access right now.');
    }
}

/* --------------------------------------------------------------------------
   5. NOTIFICATIONS & TOASTS
   -------------------------------------------------------------------------- */
function renderAnnouncementsDrawer() {
    const listMount = document.getElementById('notifList');
    if (!listMount) return;

    const announcements = ACADEMY_STATE.announcements || DEFAULT_PUBLIC_DATA.announcements;
    listMount.innerHTML = announcements.map(a => `
        <div class="notif-item ${a.unread ? 'unread' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span class="notif-tag">${a.tag}</span>
                <span style="font-size:0.75rem; color:var(--text-tertiary);">${a.time}</span>
            </div>
            <strong>${a.title}</strong>
            <p>${a.body}</p>
        </div>
    `).join('');
}

function toggleNotifDrawer(e) {
    if (e) e.stopPropagation();
    document.getElementById('notifDrawer')?.classList.toggle('open');
}

function markAllNotificationsRead() {
    document.querySelectorAll('.notif-item').forEach(item => item.classList.remove('unread'));
    const dot = document.getElementById('notifUnreadDot');
    if (dot) dot.style.display = 'none';
    const badge = document.getElementById('notifUnreadBadge');
    if (badge) badge.style.display = 'none';
    showToast('All notifications marked as read.');
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
