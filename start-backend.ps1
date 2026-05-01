# Adaptive Interview System - Backend Only
# PowerShell version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Adaptive Interview System - Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Yellow
Write-Host "API: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ROOT_DIR\backend"

if (-not (Test-Path ".venv")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

& .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
