/**
 * BPG Academy — Server-Verified Content Access Endpoint (/api/content-access)
 * Verifies section locks (applying to ALL plans including Diamond) and plan tiers
 * (Free / Gold / Diamond) on the server before returning full questions, answers,
 * or PDF downloads.
 */

const {
    gradeToClassKey,
    readAcademyState,
    resolveRequestUser,
    evaluateItemAccess,
    isAdminPasskeyValid,
    normalizePlan
} = require('./access-control');

module.exports = function contentAccessHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-token, x-student-email, x-admin-passkey');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const body = req.method === 'POST' ? (req.body || {}) : {};
    const rawClass = body.classKey || parsedUrl.searchParams.get('classKey') || '';
    const itemType = (body.itemType || parsedUrl.searchParams.get('itemType') || 'section').toLowerCase();
    const itemId = String(body.itemId || parsedUrl.searchParams.get('itemId') || '');

    const classKey = gradeToClassKey(rawClass);
    const state = readAcademyState();
    const isAdmin = isAdminPasskeyValid(req.headers['x-admin-passkey'] || body.adminPasskey);
    const user = resolveRequestUser(req);
    const portal = state.portals?.[classKey];

    // 1. Always enforce section lock FIRST for students (even Diamond!)
    const lock = state.sectionLocks?.[classKey] || { locked: false, reason: '' };
    if (!isAdmin && lock.locked) {
        res.statusCode = 403;
        res.end(JSON.stringify({
            ok: false,
            code: 'SECTION_LOCKED',
            locked: true,
            classKey,
            error: lock.reason || 'Temporarily unavailable'
        }));
        return;
    }

    if (!portal) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, code: 'NOT_FOUND', error: 'Section not found.' }));
        return;
    }

    // Section-level check only
    if (itemType === 'section') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            ok: true,
            classKey,
            locked: Boolean(lock.locked),
            userPlan: user ? normalizePlan(user.plan) : 'free'
        }));
        return;
    }

    // 2. Topic / Question lookup & server-side verification
    if (itemType === 'topic' || itemType === 'question') {
        let foundUnit = null;
        let foundTopic = null;
        for (const u of (portal.units || [])) {
            const t = (u.topics || []).find(item => String(item.id) === itemId);
            if (t) {
                foundUnit = u;
                foundTopic = t;
                break;
            }
        }

        if (!foundTopic) {
            res.statusCode = 404;
            res.end(JSON.stringify({ ok: false, code: 'NOT_FOUND', error: 'Question not found.' }));
            return;
        }

        if (!isAdmin) {
            const check = evaluateItemAccess(user, classKey, foundTopic, state);
            if (!check.allowed) {
                res.statusCode = check.status || 403;
                res.end(JSON.stringify({
                    ok: false,
                    code: check.code,
                    requiredPlan: check.requiredPlan,
                    userPlan: check.userPlan,
                    itemTitle: foundTopic.title,
                    plansConfig: state.plansConfig,
                    error: check.error
                }));
                return;
            }
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
            ok: true,
            itemType: 'topic',
            classKey,
            unit: { code: foundUnit.code, title: foundUnit.title, marks: foundUnit.marks },
            item: foundTopic
        }));
        return;
    }

    // 3. PDF / Note lookup & server-side verification
    if (itemType === 'note' || itemType === 'pdf') {
        const notes = Array.isArray(portal.notes) && portal.notes.length ? portal.notes : (portal.notesPdfs || []);
        let foundNote = notes.find(n => String(n.id) === itemId);
        if (!foundNote && /^\d+$/.test(itemId)) {
            foundNote = notes[Number(itemId)];
        }

        if (!foundNote) {
            res.statusCode = 404;
            res.end(JSON.stringify({ ok: false, code: 'NOT_FOUND', error: 'PDF resource not found.' }));
            return;
        }

        if (!isAdmin) {
            const check = evaluateItemAccess(user, classKey, foundNote, state);
            if (!check.allowed) {
                res.statusCode = check.status || 403;
                res.end(JSON.stringify({
                    ok: false,
                    code: check.code,
                    requiredPlan: check.requiredPlan,
                    userPlan: check.userPlan,
                    itemTitle: foundNote.title,
                    plansConfig: state.plansConfig,
                    error: check.error
                }));
                return;
            }
        }

        // Build downloadable summary text if no external/uploaded PDF URL is attached
        const unitsSummary = (portal.units || []).map(u => {
            const allowedTopics = (u.topics || []).filter(t => isAdmin || evaluateItemAccess(user, classKey, t, state).allowed);
            if (!allowedTopics.length) return '';
            return `[${u.code}: ${u.title}] (${u.marks || ''})\n` + allowedTopics.map(t => `  * ${t.title}`).join('\n');
        }).filter(Boolean).join('\n\n');

        res.statusCode = 200;
        res.end(JSON.stringify({
            ok: true,
            itemType: 'note',
            classKey,
            item: foundNote,
            downloadSummary: `BPG ACADEMY — ${foundNote.title}\nProgram: ${portal.gradeTitle}\nScope: ${foundNote.unit || 'All Units'} | ${foundNote.pages || 'PDF'}\n\n${unitsSummary}\n\n© 2026 BPG Academy.`
        }));
        return;
    }

    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: 'Unsupported itemType. Use section, topic, or note.' }));
};
