@echo off
echo ========================================
echo       CollabWell Server Startup
echo ========================================
echo.

echo [1/5] Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
echo     ✓ Existing processes terminated

echo.
echo [2/5] Waiting for ports to be released...
timeout /t 5 /nobreak >nul
echo     ✓ Ports should now be available

echo.
echo [3/5] Starting Backend Server (Port 5001)...
start "CollabWell Backend" cmd /k "cd /d "%~dp0backend" && echo Starting backend server... && npm run dev"
timeout /t 3 /nobreak >nul
echo     ✓ Backend server starting...

echo.
echo [4/5] Starting Frontend Server (Port 5173)...
start "CollabWell Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting frontend server... && npm run dev"
timeout /t 2 /nobreak >nul
echo     ✓ Frontend server starting...

echo.
echo [5/5] Servers are now starting up!
echo ========================================
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:5173
echo   App URL:  http://localhost:5173
echo ========================================
echo.
echo IMPORTANT: Keep both server windows open!
echo To stop servers, run stop-servers.bat
echo.
echo Press any key to close this window...
pause >nul
