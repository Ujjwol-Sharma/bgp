/**
 * BPG Academy — Request Router & Static File Server (server/router.js)
 */

const fs = require('fs');
const path = require('path');
const { ROOT_DIR, MIME_TYPES, enhanceResponse } = require('./config');

const sendEmailOtpHandler = require('../api/send-email-otp');
const verifyOtpHandler = require('../api/verify-otp');
const academyStateHandler = require('../api/academy-state');
const studentRosterHandler = require('../api/student-roster');
const contentAccessHandler = require('../api/content-access');

const API_ROUTES = {
    '/api/academy-state': academyStateHandler,
    '/api/academy-state.js': academyStateHandler,
    '/api/student-roster': studentRosterHandler,
    '/api/student-roster.js': studentRosterHandler,
    '/api/send-email-otp': sendEmailOtpHandler,
    '/api/send-email-otp.js': sendEmailOtpHandler,
    '/api/verify-otp': verifyOtpHandler,
    '/api/verify-otp.js': verifyOtpHandler,
    '/api/content-access': contentAccessHandler,
    '/api/content-access.js': contentAccessHandler
};

function parseJsonBodyAndDispatch(req, res, handler) {
    let rawBody = '';
    req.on('data', chunk => {
        rawBody += chunk;
    });
    req.on('end', () => {
        try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
            req.body = {};
        }
        handler(req, res);
    });
}

function handleRequest(req, res) {
    enhanceResponse(res);

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. Centralized Database & OTP API Routes
    if (API_ROUTES[pathname]) {
        parseJsonBodyAndDispatch(req, res, API_ROUTES[pathname]);
        return;
    }

    // 2. Clean URL Rewrites (/ -> /index.html, /admin -> /admin.html, /download -> /bpg-academy.zip)
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    } else if (pathname === '/admin' || pathname === '/admin/') {
        pathname = '/admin.html';
    } else if (pathname === '/download' || pathname === '/download/') {
        pathname = '/bpg-academy.zip';
    }

    const safeFilePath = path.normalize(path.join(ROOT_DIR, pathname));
    if (!safeFilePath.startsWith(ROOT_DIR)) {
        res.status(403).end('Forbidden');
        return;
    }

    fs.stat(safeFilePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.status(404).end('404 Not Found');
            return;
        }
        const ext = path.extname(safeFilePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Strict cache invalidation for HTML, CSS, JS, JSON, and ZIP so updates reflect immediately
        if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json' || ext === '.zip') {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            if (ext === '.zip') {
                res.setHeader('Content-Disposition', 'attachment; filename="bpg-academy.zip"');
            }
        } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(safeFilePath).pipe(res);
    });
}

module.exports = {
    handleRequest
};

