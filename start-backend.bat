@echo off
title MediGuard Backend Server
echo ====================================================
echo Starting MediGuard AI Backend on http://0.0.0.0:8000
echo ====================================================

REM Set up ADB reverse port forwarding for Android emulator if ADB exists
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8000 tcp:8000 >nul 2>&1
)

cd /d "%~dp0mediguard-backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
