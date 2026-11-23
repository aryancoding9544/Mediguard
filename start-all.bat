@echo off
title MediGuard Launcher
echo ====================================================
echo Starting MediGuard AI Backend in a new window...
echo ====================================================
start "MediGuard Backend" cmd /k "cd /d %~dp0mediguard-backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Setting up ADB reverse for Android emulator...
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8000 tcp:8000 >nul 2>&1
)

echo Starting Expo Metro Bundler...
cd /d "%~dp0mediguard-mobile"
npx expo start
