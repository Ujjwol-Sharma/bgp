/**
 * BPG Academy — Local Full-Stack Development Server Entry Point (server.js)
 * Modularized across:
 *   - server/config.js (Ports, MIME types, IP discovery, response helpers)
 *   - server/router.js (API routing & zero-cache static file delivery)
 *   - api/*.js         (Serverless-compatible database & OTP handlers)
 */

const http = require('http');
const { PORTS, getLocalIp } = require('./server/config');
const { handleRequest } = require('./server/router');

PORTS.forEach(port => {
    const server = http.createServer(handleRequest);
    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[BPG Server] Port ${port} is already active.`);
        }
    });
    const localIp = getLocalIp();
    server.listen(port, '0.0.0.0', () => {
        console.log(`BPG Academy Full-Stack Server live on port ${port}:`);
        console.log(`  -> Student Sanctuary: http://localhost:${port}/`);
        console.log(`  -> Network / Mobile : http://${localIp}:${port}/`);
        console.log(`  -> Super Admin CMS  : http://localhost:${port}/admin`);
        console.log(`  -> Database API     : http://localhost:${port}/api/academy-state`);
        console.log(`  -> 1-Person Friend  : http://${localIp}:${port}/?pass=friend`);
        console.log(`  -> Zip Download     : http://localhost:${port}/download`);
    });
});
