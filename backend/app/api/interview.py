from fastapi import APIRouter

from app.services.orchestrator import (
    get_next_question,
    update_session,
    get_session
)

from app.models.schemas import AnswerRequest
from app.features.text_features import extract_features
from app.services.evaluator import evaluate, analyze_session

router = APIRouter()

# ------------------------------
# Get Question
# ------------------------------

@router.get("/next-question")
def next_question():
    return {"question": get_next_question()}

# ------------------------------
# Submit Answer
# ------------------------------

@router.post("/submit-answer")
def submit_answer(request: AnswerRequest):
    features = extract_features(request.answer, request.response_time)
    evaluation = evaluate(features)

    session_id = "user_1"  # temporary

    update_session(session_id, features, evaluation["score"])
    session = get_session(session_id)

    insights = analyze_session(session)

    return {
        "features": features,
        "evaluation": evaluation,
        "session_insights": insights
    }