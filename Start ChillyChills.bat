@echo off
title ChillyChills Unified Server Launcher
echo 🚀 Launching ChillyChills Integrated System...
echo --------------------------------------------
echo.
echo [1/2] Checking dependencies...
cd /d "%~dp0\server"
if not exist node_modules (
    echo [!] node_modules not found. Installing...
    call npm install
)

echo [2/2] Starting Unified Server (Port 3001)...
echo.
echo 💎 Admin URL: http://localhost:3001/admin
echo 📱 App URL:   http://localhost:3001
echo.
echo Launching Admin Panel in your browser...
start http://localhost:3001/admin

:: Start the server
npm start
pause
