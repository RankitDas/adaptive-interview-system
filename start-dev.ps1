# Adaptive Interview System - Start Everything
# PowerShell version - more reliable than batch files

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Adaptive Interview System - Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ROOT_DIR

# Step 1: Check frontend dependencies
Write-Host "[1/4] Checking frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location "$ROOT_DIR\frontend"
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location $ROOT_DIR
} else {
    Write-Host "[2/4] Frontend dependencies already installed" -ForegroundColor Green
}

# Step 2: Start backend
Write-Host "[3/4] Starting backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Write-Host "       API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", `
    "cd /d `"$ROOT_DIR\backend`" && .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" `
    -WindowStyle Normal -PassThru

# Wait for backend
Write-Host ""
Write-Host "Waiting for backend to start (3 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 3: Start frontend
Write-Host "[4/4] Starting frontend on http://127.0.0.1:3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Adaptive Interview System is Starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser to: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press CTRL+C to stop the frontend server" -ForegroundColor Yellow
Write-Host ""

Set-Location "$ROOT_DIR\frontend"
& npm run dev
