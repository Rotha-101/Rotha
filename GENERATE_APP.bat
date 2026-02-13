@echo off
title EMS Dashboard Setup
setlocal enabledelayedexpansion

echo ===================================================
echo   EMS DASHBOARD: GENERATING App.exe
echo ===================================================

:: Remove old version if exists
if exist App.exe del App.exe

:: Find C# Compiler
set "CSC_PATH="
for /r "C:\Windows\Microsoft.NET\Framework64" %%f in (csc.exe) do ( if exist "%%f" set "CSC_PATH=%%f" )
if not defined CSC_PATH (
    for /r "C:\Windows\Microsoft.NET\Framework" %%f in (csc.exe) do ( if exist "%%f" set "CSC_PATH=%%f" )
)

if not defined CSC_PATH (
    echo [ERROR] Could not find the Windows C# Compiler.
    echo Please run this script as Administrator.
    pause
    exit /b
)

echo [1/1] Building App.exe...
"!CSC_PATH!" /target:winexe /out:App.exe AppLauncher.cs /reference:System.Windows.Forms.dll /reference:System.dll >nul

if %errorlevel% equ 0 (
    echo ===================================================
    echo [SUCCESS] App.exe has been created!
    echo ===================================================
    echo Now, just double-click 'App.exe' to start the app.
    echo (No more black windows will appear)
    echo ===================================================
) else (
    echo [ERROR] Failed to create App.exe.
)

pause