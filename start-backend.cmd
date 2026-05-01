@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Adaptive Interview System - Backend Only
echo ========================================
echo.
echo Starting Backend (FastAPI)...
echo API: http://127.0.0.1:8000
echo Docs: http://127.0.0.1:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%backend"

if not exist ".venv" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv .venv
    pause
    exit /b 1
)

.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
