/**
 * BPG Academy — Server Configuration & Helpers (server/config.js)
 */

const path = require('path');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const PORTS = [Number(process.env.PORT) || 3000, 5500];

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.zip': 'application/zip'
};

function getLocalIp() {
    try {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name] || []) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
    } catch (e) {}
    return '127.0.0.1';
}

function enhanceResponse(res) {
    res.status = function (code) {
        res.statusCode = code;
        return res;
    };
    res.json = function (obj) {
        if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        res.end(JSON.stringify(obj));
        return res;
    };
    return res;
}

module.exports = {
    ROOT_DIR,
    PORTS,
    MIME_TYPES,
    getLocalIp,
    enhanceResponse
};

