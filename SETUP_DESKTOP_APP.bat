@echo off
title EMS Setup
setlocal enabledelayedexpansion

echo ===================================================
echo   EMS DASHBOARD: CREATING DESKTOP APP
echo ===================================================

:: 1. Build the App.exe
set "CSC_PATH="
for /r "C:\Windows\Microsoft.NET\Framework64" %%f in (csc.exe) do ( if exist "%%f" set "CSC_PATH=%%f" )
if not defined CSC_PATH (
    for /r "C:\Windows\Microsoft.NET\Framework" %%f in (csc.exe) do ( if exist "%%f" set "CSC_PATH=%%f" )
)

if not defined CSC_PATH (
    echo [ERROR] C# Compiler not found. Please install .NET Framework.
    pause
    exit /b
)

echo [1/2] Compiling App.exe...
"!CSC_PATH!" /target:winexe /out:App.exe AppLauncher.cs /reference:System.Windows.Forms.dll /reference:System.dll >nul

if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b
)

:: 2. Create Desktop Shortcut
echo [2/2] Creating Desktop Shortcut...
set "SCRIPT_PATH=%~dp0App.exe"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\EMS Dashboard.lnk"

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_PATH%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = 'shell32.dll, 12'; $Shortcut.Save()"

echo ===================================================
echo SUCCESS!
echo 1. An 'App.exe' has been created in this folder.
echo 2. A shortcut 'EMS Dashboard' is now on your Desktop.
echo ===================================================
echo You can now close this window and double-click the 
echo 'EMS Dashboard' icon on your desktop to start.
echo ===================================================
pause