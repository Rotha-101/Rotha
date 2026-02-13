@echo off
title EMS Dashboard Runner
setlocal enabledelayedexpansion
:: Set working directory to the batch file location
cd /d "%~dp0"

echo ===================================================
echo   EMS HOURLY REPORT SYSTEM - INITIALIZING
echo ===================================================

:: 1. Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Node.js is not installed. Please download it from https://nodejs.org', 'EMS Fatal Error', 'OK', 'Error')"
    pause
    exit /b
)

:: 2. Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing required engine components...
    echo [INFO] This may take a minute. Please wait...
    call npm install --no-audit --no-fund --quiet
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Check your internet connection.
        pause
        exit /b
    )
)

:: 3. Start the application via Vite
:: Vite is configured in vite.config.ts to open the browser automatically
echo [INFO] Starting Dashboard Server...
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The application server stopped unexpectedly.
    pause
)
endlocal