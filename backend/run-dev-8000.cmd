@echo off
cd /d C:\projects\adaptive-interview-system\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > C:\projects\adaptive-interview-system\backend\backend-8000.log 2> C:\projects\adaptive-interview-system\backend\backend-8000.err
