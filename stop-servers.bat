@echo off
echo Stopping CollabWell Servers...
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo All servers stopped!
echo.
pause
