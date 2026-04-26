from fastapi import APIRouter
from app.services.orchestrator import get_next_question
from app.models.schemas import AnswerRequest
from app.features.text_features import extract_features
from app.services.evaluator import evaluate

# ✅ DEFINE router FIRST
router = APIRouter()

# ---------- GET: next question ----------
@router.get("/next-question")
def next_question():
    return {"question": get_next_question()}

# ---------- POST: submit answer ----------
@router.post("/submit-answer")
def submit_answer(request: AnswerRequest):
    features = extract_features(request.answer, request.response_time)
    result = evaluate(features)

    return {
        "features": features,
        "evaluation": result
    }