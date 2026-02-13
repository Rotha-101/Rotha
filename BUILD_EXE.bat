@echo off
title EMS App.exe Generator
setlocal enabledelayedexpansion

echo ===================================================
echo EMS DASHBOARD: GENERATING App.exe
echo ===================================================

:: Find C# Compiler (csc.exe) in standard Windows locations
set "CSC_PATH="
set "ROOT_NET=C:\Windows\Microsoft.NET\Framework64"
if not exist "!ROOT_NET!" set "ROOT_NET=C:\Windows\Microsoft.NET\Framework"

for /r "!ROOT_NET!" %%f in (csc.exe) do (
    if exist "%%f" set "CSC_PATH=%%f"
)

if not defined CSC_PATH (
    echo [ERROR] C# Compiler not found. 
    echo Please install .NET Framework or run as Administrator.
    pause
    exit /b
)

echo [INFO] Using Compiler: !CSC_PATH!
echo [INFO] Compiling AppLauncher.cs...

"!CSC_PATH!" /target:winexe /out:App.exe AppLauncher.cs /reference:System.Windows.Forms.dll /reference:System.dll

if %errorlevel% equ 0 (
    echo ===================================================
    echo [SUCCESS] App.exe created successfully!
    echo ===================================================
    echo You can now use App.exe to launch the system.
    echo Cleaning up temporary files...
    del AppLauncher.cs
) else (
    echo [ERROR] Compilation failed. Check your permissions.
)

pause