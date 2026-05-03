from app.core.config import bootstrap_local_packages
bootstrap_local_packages()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api import interview

app = FastAPI()

# 🔥 IMPORTANT: allow your Vercel domain + localhost
# (replace YOUR-VERCEL-URL with your real URL if different)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://adaptive-interview-system.vercel.app",
        "https://adaptive-interview-system-git-main.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)


@app.get("/")
def root():
    return {"message": "Backend running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    favicon_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "static",
        "favicon.svg"
    )

    if os.path.exists(favicon_path):
        return FileResponse(favicon_path, media_type="image/svg+xml")

    return {"status": "favicon not available"}


static_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "static"
)

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")