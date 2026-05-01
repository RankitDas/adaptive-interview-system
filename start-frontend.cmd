@echo off
REM Start only frontend

echo Starting Frontend (Next.js)...
echo App will be available at: http://127.0.0.1:3000
echo.

cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        exit /b 1
    )
)

call npm run dev
