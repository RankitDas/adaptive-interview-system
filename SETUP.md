# Adaptive Interview System - Setup & Run Guide

This guide will help you set up and run the Adaptive Interview System on your local machine.

## 📋 Prerequisites

Ensure you have the following installed:
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** with npm ([Download](https://nodejs.org/))
- **Git** (for version control)

Verify installations:
```bash
python --version
npm --version
```

## 🚀 Quick Start - Run Everything

### Option 1: Run Both Backend & Frontend Together (Recommended)

1. Navigate to the project root:
```bash
cd c:\projects\adaptive-interview-system
```

2. Double-click `start-dev.cmd` or run in terminal:
```bash
start-dev.cmd
```

This will:
- ✅ Install frontend dependencies (if needed)
- ✅ Start FastAPI backend on `http://127.0.0.1:8000`
- ✅ Start Next.js frontend on `http://127.0.0.1:3000`

3. Open your browser and go to: **http://127.0.0.1:3000**

---

## 🔧 Individual Setup & Run

### Backend Setup (FastAPI + Uvicorn)

1. Navigate to backend directory:
```bash
cd backend
```

2. The virtual environment should already be set up. If not, create it:
```bash
python -m venv .venv
```

3. Activate virtual environment:
```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
.\.venv\Scripts\activate.bat

# macOS/Linux
source .venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run backend:
```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or use the shortcut script:
```bash
cd c:\projects\adaptive-interview-system
start-backend.cmd
```

**Backend will be available at:** `http://127.0.0.1:8000`
**API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`

---

### Frontend Setup (Next.js)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Or use the shortcut script:
```bash
cd c:\projects\adaptive-interview-system
start-frontend.cmd
```

**Frontend will be available at:** `http://127.0.0.1:3000`

---

## 📝 Project Structure

```
adaptive-interview-system/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── core/           # Configuration
│   │   ├── features/       # Feature extraction
│   │   └── main.py         # FastAPI app entry
│   ├── requirements.txt     # Python dependencies
│   └── .venv/             # Virtual environment
│
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # Pages & layouts
│   │   ├── components/    # React components
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS styles
│   ├── package.json        # npm dependencies
│   ├── .env.local         # Environment config
│   └── tsconfig.json      # TypeScript config
│
├── data/                   # Question banks
│   ├── questions.json     # Theory questions
│   └── coding_questions.json  # Coding questions
│
├── start-dev.cmd          # Run everything
├── start-backend.cmd      # Run backend only
├── start-frontend.cmd     # Run frontend only
└── SETUP.md               # This file
```

---

## 🔌 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

This file is already created. No changes needed for localhost development.

**Backend Configuration**
Backend configuration is in `backend/app/core/config.py`:
- Theory time limit: 180 seconds
- Coding time limit: 900 seconds
- Session target questions: 5
- Warning limit: 5

---

## 🛠️ Troubleshooting

### Port Already in Use

**Error:** `Address already in use (port 3000 or 8000)`

**Solution:** Kill the process using that port:
```bash
# Windows - Kill port 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Or use PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Virtual Environment Issues

**Error:** `pip is not recognized` or Python import errors

**Solution:** Recreate the virtual environment:
```bash
cd backend
rmdir /s /q .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend Dependencies Issues

**Error:** `npm ERR!` or module not found

**Solution:** Clear and reinstall:
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Backend Not Responding

**Error:** `fetch failed` or `Connection refused`

**Solution:**
1. Verify backend is running on port 8000
2. Check `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`
3. Check CORS settings in `backend/app/main.py` (should allow all origins for development)

---

## 📚 API Endpoints

### Interview Endpoints
- `GET /next-question?personality=normal&round_type=theory` - Get next question
- `POST /submit-answer` - Submit an answer
- `POST /reset-session` - Reset interview session
- `POST /session-warning` - Register warning (tab switch, etc.)
- `POST /terminate-session` - Terminate session
- `GET /session-review` - Get session review
- `POST /compile-c` - Compile and run C code

### Resume ATS Endpoint
- `POST /ats/evaluate` - Evaluate resume against job description

**Interactive API Docs:** `http://127.0.0.1:8000/docs`

---

## 🎯 Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/app/`
   - Backend auto-reloads with `--reload` flag
   - Check `http://127.0.0.1:8000/docs` for API changes

2. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Next.js hot-reloads automatically
   - Check `http://127.0.0.1:3000` for UI changes

### Running Tests

```bash
# Backend tests (if available)
cd backend
pytest

# Frontend tests (if available)
cd frontend
npm test
```

---

## 📦 Building for Production

### Backend
```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## 🔐 Security Notes

- CORS is set to allow all origins (`*`) for development. Restrict this in production.
- The `.env.local` file is git-ignored and should never be committed.
- Backend session data is stored in memory. Use a database in production.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API docs at `http://127.0.0.1:8000/docs`
3. Check console logs in both frontend and backend terminals

---

**Enjoy your adaptive interview system! 🎉**
