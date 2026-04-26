@echo off
cd /d C:\projects\adaptive-interview-system\frontend
set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002
npm.cmd run dev -- --hostname 127.0.0.1 --port 3002 > C:\projects\adaptive-interview-system\frontend\frontend-3002.log 2> C:\projects\adaptive-interview-system\frontend\frontend-3002.err
