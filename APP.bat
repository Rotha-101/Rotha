@echo off
title EMS Dashboard Runner
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===================================================
echo   EMS HOURLY REPORT SYSTEM - INITIALIZING
echo ===================================================

:: 1. Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Node.js is not installed. Please download it from https://nodejs.org', 'EMS Error', 'OK', 'Error')"
    pause
    exit /b
)

echo [OK] Node.js Detected: 
node -v

:: 2. Install dependencies if missing
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing required engine components...
    echo [INFO] This may take 30-60 seconds. Please wait...
    call npm install --no-audit --no-fund --quiet
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Check your internet connection.
        pause
        exit /b
    )
    echo [OK] Components Installed Successfully.
)

:: 3. Start the application
echo [INFO] Starting Dashboard Server...
echo [INFO] Your browser will open automatically once ready.
echo [INFO] (Press Ctrl+C in this window to stop the system)
echo ---------------------------------------------------

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The application server stopped unexpectedly.
    pause
)
endlocal