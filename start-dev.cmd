@echo off
setlocal enabledelayedexpansion
REM Run backend and frontend together

echo.
echo ========================================
echo  Adaptive Interview System - Development
echo ========================================
echo.

REM Get the directory where this script is located
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

REM Check if node_modules exists for frontend
echo [1/4] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd /d "%ROOT_DIR%"
) else (
    echo [2/4] Frontend dependencies already installed
)

echo [3/4] Starting backend on http://127.0.0.1:8000...
echo         API Docs: http://127.0.0.1:8000/docs
REM Start backend in a new window
start "Backend - FastAPI" cmd /k "cd /d "%ROOT_DIR%backend" && .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM Wait for backend to start
echo.
echo Waiting for backend to start (3 seconds)...
timeout /t 3 /nobreak

echo [4/4] Starting frontend on http://127.0.0.1:3000...
echo.
echo ========================================
echo  Adaptive Interview System is Starting!
echo ========================================
echo.
echo Open your browser to: http://127.0.0.1:3000
echo.
echo Press CTRL+C to stop the frontend server
echo.

cd /d "%ROOT_DIR%frontend"
call npm run dev
