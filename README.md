# 🎓 Adaptive Interview System

An intelligent interview platform with adaptive difficulty, real-time code compilation, resume evaluation, and interactive coaching.

## ⚡ Quick Start (30 seconds)

### Run Everything:
```bash
start-dev.cmd
```

Then open: **http://127.0.0.1:3000**

That's it! Both backend and frontend will start automatically.

---

## 📚 Documentation

Choose what you need:

| Document | Purpose |
|----------|---------|
| **[SYSTEM_READY.md](SYSTEM_READY.md)** | 👈 **START HERE** - Current system status & how to run |
| **[QUICK_START.md](QUICK_START.md)** | Fast 2-minute getting started guide |
| **[SETUP.md](SETUP.md)** | Comprehensive setup & troubleshooting |
| **[INITIALIZATION_COMPLETE.md](INITIALIZATION_COMPLETE.md)** | What was fixed & verified |

---

## 🎯 Features

### 🎓 Interview Modes
- **Theory Questions** - DSA, system design, concepts
- **Coding Questions** - Write, compile, and test C code

### 👤 Interview Personalities
- Friendly, Normal, Strict (affects feedback tone)

### 📊 Analytics
- Performance tracking
- Session review with feedback
- Adaptive difficulty adjustment
- Response time analysis

### 💼 Additional Features
- Resume/ATS evaluation
- Real-time code compilation
- Anti-cheating (tab-switch detection)
- Session persistence

---

## 🏗️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server
- **PyPDF2** - PDF document handling
- **python-docx** - Word document handling

### Frontend
- **React 18** - UI library
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **CSS** - Styling

---

## 🚀 Running the System

### Option 1: Run Everything (Recommended)
```bash
start-dev.cmd
```

### Option 2: PowerShell Version
```powershell
.\start-dev.ps1
```

### Option 3: Run Separately
```bash
# Terminal 1 - Backend
start-backend.cmd

# Terminal 2 - Frontend  
start-frontend.cmd
```

---

## 🌐 Access Points

- **App:** http://127.0.0.1:3000
- **Backend:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

---

## ✅ System Status

All components verified and working:
- ✅ Backend (FastAPI) on port 8000
- ✅ Frontend (Next.js) on port 3000
- ✅ Dependencies installed
- ✅ Configuration complete
- ✅ Database files present

---

## 📁 Project Structure

```
adaptive-interview-system/
├── start-dev.cmd               # 👈 Click to run everything!
├── backend/                    # Python FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   └── models/
│   ├── requirements.txt
│   └── .venv/
├── frontend/                   # React + Next.js application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── .env.local
└── data/                       # Question databases
    ├── questions.json
    └── coding_questions.json
```

---

## 🛠️ Common Commands

### Development

```bash
# Run everything (from project root)
start-dev.cmd

# Run only backend (from project root)
start-backend.cmd

# Run only frontend (from project root)  
start-frontend.cmd

# Manual backend start (from backend dir)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Manual frontend start (from frontend dir)
npm run dev
```

### Building for Production

```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
npm start
```

---

## 🔍 Troubleshooting

### Port in Use?
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### Missing Dependencies?
```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

For more help, see **[SETUP.md](SETUP.md)**

---

## 📖 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/next-question` | GET | Get next interview question |
| `/submit-answer` | POST | Submit answer for evaluation |
| `/compile-c` | POST | Compile and run C code |
| `/reset-session` | POST | Reset interview session |
| `/session-review` | GET | Get session feedback |
| `/ats/evaluate` | POST | Evaluate resume |

Full API docs: **http://127.0.0.1:8000/docs** (when running)

---

## 🎓 First Time?

1. Read: [SYSTEM_READY.md](SYSTEM_READY.md) (5 min read)
2. Run: `start-dev.cmd`
3. Open: http://127.0.0.1:3000
4. Click: "Begin Interview"
5. Select personality and round type
6. Start answering questions!

---

## 💡 Use Cases

- **Practice Interviews** - Prepare for technical interviews
- **Skill Assessment** - Evaluate coding and communication skills
- **Interview Coaching** - Get real-time feedback
- **Resume Review** - ATS-score your resume

---

## 🤝 Development Workflow

### Backend Changes
Edit files in `backend/app/` → Auto-reloads with `--reload` flag

### Frontend Changes
Edit files in `frontend/src/` → Hot-reload in browser

### Check API Changes
Visit: http://127.0.0.1:8000/docs (updated automatically)

---

## 📊 System Architecture

```
┌─────────────────┐
│  Browser        │
│ http://127.0.01 │
│:3000 (React)    │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Next.js        │
│  Frontend       │
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────┐
│  FastAPI        │
│  Backend        │
│ :8000           │
└─────────────────┘
         │
         ▼
    ┌─────────┐
    │ Data    │
    │ JSON    │
    └─────────┘
```

---

## 🎉 Ready to Go!

Your system is fully configured and tested. 

**Start with:**
```bash
start-dev.cmd
```

**Questions?** Check [QUICK_START.md](QUICK_START.md) or [SETUP.md](SETUP.md)

---

## 📝 License

See [LICENSE](LICENSE) file

---

## 🚀 Happy Interviewing!

Build your interview skills with the Adaptive Interview System! 🎓
