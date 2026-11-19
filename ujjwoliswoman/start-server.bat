@echo off
title BPG Academy Server
echo ====================================================
echo Starting BPG Academy Server on http://localhost:3000
echo ====================================================
cd /d "%~dp0"
"..\node-cli\node-v20.18.0-win-x64\node.exe" server.js
pause
