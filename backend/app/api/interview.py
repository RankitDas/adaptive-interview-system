from fastapi import APIRouter
from app.services.orchestrator import get_next_question

router = APIRouter()

@router.get("/next-question")
def next_question():
    question = get_next_question()
    return {"question": question}