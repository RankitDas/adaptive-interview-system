# 🚀 Quick Start Guide - Adaptive Interview System

## ⚡ Fastest Way to Run Everything (30 seconds)

### For Windows Users:

**Option A: Double-click (Easiest)**
1. Open the project folder in File Explorer
2. Find and double-click: **`start-dev.cmd`**
3. Wait for the terminal windows to appear
4. **Open browser to:** http://127.0.0.1:3000

**Option B: Run from PowerShell (Recommended)**
```powershell
cd c:\projects\adaptive-interview-system
.\start-dev.ps1
```

**Option C: Run from Command Prompt**
```cmd
cd c:\projects\adaptive-interview-system
start-dev.cmd
```

---

## 🎯 What You'll See

When you run the script, you should see:

1. **Two terminal windows open**
   - Backend window: Shows FastAPI server starting
   - Frontend window: Shows Next.js dev server starting

2. **Backend Terminal Output:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete
   ```

3. **Frontend Terminal Output:**
   ```
   ▲ Next.js 14.2.5
   - Local: http://localhost:3000
   ```

4. **Browser:** http://127.0.0.1:3000 opens automatically

---

## 🔌 Run Them Separately (If You Need To)

### Start Only Backend:

**CMD:**
```cmd
c:\projects\adaptive-interview-system\start-backend.cmd
```

**PowerShell:**
```powershell
cd c:\projects\adaptive-interview-system
.\start-backend.ps1
```

Backend will be at: http://127.0.0.1:8000
API Docs at: http://127.0.0.1:8000/docs

---

### Start Only Frontend:

**CMD:**
```cmd
c:\projects\adaptive-interview-system\start-frontend.cmd
```

**PowerShell:**
```powershell
cd c:\projects\adaptive-interview-system
.\start-frontend.ps1
```

Frontend will be at: http://127.0.0.1:3000

**IMPORTANT:** Backend must be running on port 8000!

---

## ✅ How to Know Everything is Working

### Backend is Running:
- [ ] Terminal shows: `INFO: Application startup complete`
- [ ] You can open: http://127.0.0.1:8000/docs (API Documentation)
- [ ] Response shows: `{"message": "Backend running"}`

### Frontend is Running:
- [ ] Terminal shows: `Ready in X.Xs`
- [ ] You can open: http://127.0.0.1:3000
- [ ] You see the Adaptive Interview System UI

### Both Connected:
- [ ] Click "Begin Interview" button
- [ ] Select a personality and round type
- [ ] A question appears from the backend

---

## 🛑 How to Stop

1. **Frontend Terminal:** Press `CTRL+C`
2. **Backend Terminal:** Press `CTRL+C`

Or just close the terminal windows.

---

## ❌ If Something Goes Wrong

### Error: "Port already in use (3000 or 8000)"

Kill the process:
```powershell
# For port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# For port 8000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### Error: "npm not found" or "package.json not found"

Make sure you're running the script from the project root:
```cmd
cd c:\projects\adaptive-interview-system
start-dev.cmd
```

### Error: "Virtual environment not found"

The backend needs Python setup:
```powershell
cd c:\projects\adaptive-interview-system\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend shows "Cannot reach API"

- [ ] Backend is running on port 8000
- [ ] Check `.env.local` has: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
- [ ] Restart frontend: Close terminal and run `start-frontend` again

---

## 📚 Files You Can Run

| File | What It Does | Use When |
|------|-------------|----------|
| `start-dev.cmd` | Runs everything | You want both backend + frontend |
| `start-backend.cmd` | Runs only backend | You're debugging backend code |
| `start-frontend.cmd` | Runs only frontend | You're debugging frontend code |
| `start-dev.ps1` | PowerShell version | Preferred over .cmd on modern Windows |
| `start-backend.ps1` | PowerShell backend | For PowerShell users |
| `start-frontend.ps1` | PowerShell frontend | For PowerShell users |

---

## 🌐 Where to Find Things

- **Main App:** http://127.0.0.1:3000
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs (Interactive Swagger UI)
- **Backend Health Check:** http://127.0.0.1:8000/ (Should show: `{"message": "Backend running"}`)

---

## 📝 Environment Setup

Everything is already configured! Your `.env.local` has:
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

This tells the frontend where to find the backend.

---

## 🎓 First Steps in the App

1. **Begin Interview** - Click to start
2. **Select Personality** - friendly, normal, or strict
3. **Select Round** - theory or coding
4. **Answer Questions** - Theory: text answers, Coding: write C code
5. **Get Feedback** - See evaluation and coaching tips
6. **Review Session** - Check your performance

---

## 🤔 Common Questions

**Q: Do I need to run both backend and frontend?**
A: Yes! The frontend won't work without the backend running on port 8000.

**Q: Can I run them on different ports?**
A: Backend is fixed to port 8000. Frontend can be changed in `next.config.js` if needed.

**Q: Why do I see two terminal windows?**
A: One for the Python backend, one for the Node.js frontend. Both need to run simultaneously.

**Q: How do I stop it all?**
A: Press CTRL+C in each terminal, or close the windows.

---

## 🚀 Ready to Go!

Your system is completely set up. Just run one of the start scripts and you're ready to interview!

```
start-dev.cmd
```

**Happy coding!** 🎉
