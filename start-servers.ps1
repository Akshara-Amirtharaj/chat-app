# CollabWell Server Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       CollabWell Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Stopping any existing servers..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "    ✓ Existing processes terminated" -ForegroundColor Green
} catch {
    Write-Host "    ✓ No existing processes found" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "    ✓ Ports should now be available" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Starting Backend Server (Port 5001)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$backendPath`" && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2
Write-Host "    ✓ Backend server starting..." -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$frontendPath`" && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2
Write-Host "    ✓ Frontend server starting..." -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Servers are now starting up!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  App URL:  http://localhost:5173" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Keep both server windows open!" -ForegroundColor Red
Write-Host "To stop servers, run stop-servers.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
