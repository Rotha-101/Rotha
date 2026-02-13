
' EMS Dashboard Silent Launcher
Option Explicit
Dim objShell, objFSO, strPath, strCommand
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = strPath
' Use triple quotes to wrap the path correctly for CMD
strCommand = "cmd /c """"" & strPath & "\APP.bat"""" "
objShell.Run strCommand, 0, False
Set objShell = Nothing
Set objFSO = Nothing
