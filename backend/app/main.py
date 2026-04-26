from app.core.config import bootstrap_local_packages

bootstrap_local_packages()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import interview

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview.router)


@app.get("/")
def root():
    return {"message": "Backend running"}
