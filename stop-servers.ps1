# CollabWell Server Stop Script
Write-Host "========================================" -ForegroundColor Red
Write-Host "       Stopping CollabWell Servers" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "✓ Stopped $($processes.Count) Node.js process(es)" -ForegroundColor Green
    } else {
        Write-Host "✓ No Node.js processes found" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error stopping processes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All CollabWell servers have been stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
