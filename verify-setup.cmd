@echo off
REM Verification script for Adaptive Interview System
REM This script checks that all components are properly set up

echo.
echo ========================================
echo  System Verification Script
echo ========================================
echo.

setlocal enabledelayedexpansion
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/7] Checking project structure...
if not exist "%BACKEND_DIR%" (
    echo ❌ Backend directory not found
    exit /b 1
) else (
    echo ✅ Backend directory found
)

if not exist "%FRONTEND_DIR%" (
    echo ❌ Frontend directory not found
    exit /b 1
) else (
    echo ✅ Frontend directory found
)

echo.
echo [2/7] Checking backend virtual environment...
if not exist "%BACKEND_DIR%\.venv" (
    echo ❌ Virtual environment not found
    exit /b 1
) else (
    echo ✅ Virtual environment found
)

echo.
echo [3/7] Checking Python packages...
cd /d "%BACKEND_DIR%"
.\.venv\Scripts\python.exe -m pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo ❌ FastAPI not installed
    exit /b 1
) else (
    echo ✅ FastAPI installed
)

.\.venv\Scripts\python.exe -m pip show uvicorn >nul 2>&1
if errorlevel 1 (
    echo ❌ Uvicorn not installed
    exit /b 1
) else (
    echo ✅ Uvicorn installed
)

echo.
echo [4/7] Checking frontend node_modules...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo ❌ Frontend dependencies not installed
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
)

echo.
echo [5/7] Checking .env.local configuration...
if not exist "%FRONTEND_DIR%\.env.local" (
    echo ❌ Environment file not found
    exit /b 1
) else (
    findstr /C:"NEXT_PUBLIC_API_BASE_URL" "%FRONTEND_DIR%\.env.local" >nul
    if errorlevel 1 (
        echo ❌ API URL not configured in .env.local
        exit /b 1
    ) else (
        echo ✅ Environment configured
    )
)

echo.
echo [6/7] Checking question data files...
if not exist "%ROOT_DIR%data\questions.json" (
    echo ❌ Theory questions file not found
    exit /b 1
) else (
    echo ✅ Theory questions file found
)

if not exist "%ROOT_DIR%data\coding_questions.json" (
    echo ❌ Coding questions file not found
    exit /b 1
) else (
    echo ✅ Coding questions file found
)

echo.
echo [7/7] Checking startup scripts...
set "scripts_ok=1"
if not exist "%ROOT_DIR%start-dev.cmd" (
    echo ❌ start-dev.cmd not found
    set "scripts_ok=0"
) else (
    echo ✅ start-dev.cmd found
)

if not exist "%ROOT_DIR%start-backend.cmd" (
    echo ❌ start-backend.cmd not found
    set "scripts_ok=0"
) else (
    echo ✅ start-backend.cmd found
)

if not exist "%ROOT_DIR%start-frontend.cmd" (
    echo ❌ start-frontend.cmd not found
    set "scripts_ok=0"
) else (
    echo ✅ start-frontend.cmd found
)

echo.
echo ========================================
echo  ✅ All Checks Passed!
echo ========================================
echo.
echo The system is ready to run.
echo.
echo To start the application, run:
echo   start-dev.cmd
echo.
echo Then open browser to: http://127.0.0.1:3000
echo.
pause
