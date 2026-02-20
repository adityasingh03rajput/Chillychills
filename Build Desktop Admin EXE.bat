@echo off
title ChillyAdmin Pro - Standalone EXE Builder
echo 💎 Preparing Premium Desktop Software Build...
echo --------------------------------------------
echo.
cd /d "%~dp0\admin-desktop-app"

echo [1/3] Installing Electron Build Tools...
call npm install

echo.
echo [2/3] Embedding Server URL...
:: No change needed as it's in config.json, but user can edit it here if they want
echo Current Server URL is set in config.json. 
echo.

echo [3/3] Compiling to Standalone EXE...
echo This will take a moment. Packaging all assets into a portable executable...
call npm run build

echo.
echo --------------------------------------------
echo ✅ BUILD COMPLETE!
echo.
echo Your standalone EXE is ready in: \admin-desktop-app\dist\
echo File Name: ChillyAdmin Pro 1.0.0.exe
echo.
pause
