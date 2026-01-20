@echo off
setlocal
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
set APP_ID=com.chillychills.app

echo ==========================================
echo    CHILLY CHILLS - BUILD ^& INSTALL
echo ==========================================

echo [1/4] Building web assets...
call npm run build
if %errorlevel% neq 0 goto :error

echo.
echo [2/4] Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 goto :error

echo.
echo [3/4] Building Android APK...
pushd android
call gradlew.bat assembleDebug
popd
if %errorlevel% neq 0 goto :error

echo.
echo [4/4] Installing APK to device...
adb install -r "%APK_PATH%"
if %errorlevel% neq 0 goto :error

echo.
echo [READY] Launching app...
adb shell monkey -p %APP_ID% -c android.intent.category.LAUNCHER 1

echo.
echo ==========================================
echo    BUILD ^& INSTALL SUCCESSFUL! 🚀
echo ==========================================
pause
exit /b 0

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo    BUILD FAILED - PLEASE CHECK LOGS
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
exit /b 1
