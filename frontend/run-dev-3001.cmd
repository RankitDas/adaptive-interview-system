@echo off
cd /d C:\projects\adaptive-interview-system\frontend
set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
npm.cmd run dev -- --hostname 127.0.0.1 --port 3001 > C:\projects\adaptive-interview-system\frontend\frontend-3001.log 2> C:\projects\adaptive-interview-system\frontend\frontend-3001.err
