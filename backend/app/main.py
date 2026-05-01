from app.core.config import bootstrap_local_packages

bootstrap_local_packages()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api import interview

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)


@app.get("/")
def root():
    return {"message": "Backend running"}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Serve favicon.svg as favicon.ico to prevent 404 errors"""
    favicon_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "static",
        "favicon.svg"
    )
    
    if os.path.exists(favicon_path):
        return FileResponse(
            favicon_path,
            media_type="image/svg+xml"
        )
    
    # Fallback: return a minimal response if favicon not found
    return {"status": "favicon not available"}


# Mount static files directory
static_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "static"
)
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
