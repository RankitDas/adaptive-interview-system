# Adaptive Interview System - Frontend Only
# PowerShell version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Adaptive Interview System - Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Yellow
Write-Host "App: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: Make sure backend is running on port 8000!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ROOT_DIR\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
& npm run dev
