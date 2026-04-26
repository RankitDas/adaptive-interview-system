import json
import random

from app.core.config import (
    CODING_QUESTIONS_PATH,
    CODING_TIME_LIMIT,
    SESSION_TARGET_QUESTIONS,
    THEORY_QUESTIONS_PATH,
    THEORY_TIME_LIMIT,
    WARNING_LIMIT,
)
from app.services.adaptive import decide_difficulty, get_adaptive_question

QUESTION_BANKS = {
    "theory": THEORY_QUESTIONS_PATH,
    "coding": CODING_QUESTIONS_PATH,
}

TIME_LIMITS = {
    "theory": THEORY_TIME_LIMIT,
    "coding": CODING_TIME_LIMIT,
}

sessions = {}


def load_questions(round_type="theory"):
    with open(QUESTION_BANKS[round_type], "r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def start_session(session_id: str):
    sessions[session_id] = {
        "answers": [],
        "scores": [],
        "asked_question_ids": {
            "theory": [],
            "coding": [],
        },
        "current_question_id": None,
        "current_round": "theory",
        "current_time_limit": THEORY_TIME_LIMIT,
        "personality": "normal",
        "warnings": 0,
        "warning_limit": WARNING_LIMIT,
        "terminated": False,
        "termination_reason": None,
        "last_warning_reason": None,
    }


def get_or_create_session(session_id: str):
    if session_id not in sessions:
        start_session(session_id)

    return sessions[session_id]


def update_session(session_id: str, features, score, round_type):
    session = get_or_create_session(session_id)
    session["answers"].append(features)
    session["scores"].append(score)
    session["current_question_id"] = None
    session["current_round"] = round_type
    session["current_time_limit"] = TIME_LIMITS[round_type]


def get_session(session_id: str):
    return sessions.get(session_id, None)


def _calculate_round_breakdown(answers):
    return {
        "theory": sum(1 for answer in answers if answer.get("round_type") == "theory"),
        "coding": sum(1 for answer in answers if answer.get("round_type") == "coding"),
    }


def summarize_session(session=None):
    if not session:
        return {
            "answered_count": 0,
            "average_score": 0.0,
            "average_response_time": 0.0,
            "strengths": ["Fresh session ready. Start with a focused and structured answer."],
            "focus_areas": ["Keep answers original, stay on the tab, and manage time deliberately."],
            "recent_scores": [],
            "completion_rate": 0.0,
            "recommended_difficulty": "easy",
            "current_personality": "normal",
            "asked_question_ids": {"theory": [], "coding": []},
            "current_question_id": None,
            "current_round": "theory",
            "current_time_limit": THEORY_TIME_LIMIT,
            "warnings": 0,
            "warning_limit": WARNING_LIMIT,
            "terminated": False,
            "termination_reason": None,
            "target_questions": SESSION_TARGET_QUESTIONS,
            "round_breakdown": {"theory": 0, "coding": 0},
            "status": "ready",
            "last_warning_reason": None,
        }

    answers = session["answers"]
    scores = session["scores"]
    answered_count = len(scores)
    average_score = round(sum(scores) / answered_count, 2) if answered_count else 0.0
    average_response_time = (
        round(sum(answer["response_time"] for answer in answers) / len(answers), 2)
        if answers else 0.0
    )
    round_breakdown = _calculate_round_breakdown(answers)

    theory_answers = [answer for answer in answers if answer.get("round_type") == "theory"]
    coding_answers = [answer for answer in answers if answer.get("round_type") == "coding"]

    strengths = []
    focus_areas = []

    if theory_answers and sum(answer["word_count"] for answer in theory_answers) / len(theory_answers) >= 20:
        strengths.append("Theory answers are showing enough structure to sound thought through.")
    elif theory_answers:
        focus_areas.append("Expand theory responses with clearer reasoning and one example.")

    if coding_answers and sum(1 for answer in coding_answers if answer.get("compiled_successfully")) >= 1:
        strengths.append("At least one coding submission compiled cleanly.")
    elif coding_answers:
        focus_areas.append("Compile and retest coding answers before submission.")

    if answers and sum(answer["pressure_ratio"] for answer in answers) / len(answers) <= 0.75:
        strengths.append("Your time management is mostly under control.")
    elif answers:
        focus_areas.append("Manage the timer better. Get to the core answer sooner.")

    if session.get("warnings", 0) > 0:
        focus_areas.append("Interview integrity warnings were triggered. Stay on the active tab.")

    if average_score >= 2.25:
        strengths.append("The session score trend is healthy.")
    elif answered_count:
        focus_areas.append("Lift consistency across rounds before the next mock interview.")

    if not strengths:
        strengths.append("The session is gathering signal for more precise feedback.")
    if not focus_areas:
        focus_areas.append("Continue mixing theory and coding rounds to maintain balanced progress.")

    if session.get("terminated"):
        status = "terminated"
    elif answered_count >= SESSION_TARGET_QUESTIONS:
        status = "completed"
    elif session.get("current_question_id") is not None:
        status = "active"
    else:
        status = "ready"

    return {
        "answered_count": answered_count,
        "average_score": average_score,
        "average_response_time": average_response_time,
        "strengths": strengths,
        "focus_areas": focus_areas,
        "recent_scores": scores[-5:],
        "completion_rate": min(answered_count / SESSION_TARGET_QUESTIONS, 1.0),
        "recommended_difficulty": decide_difficulty(session),
        "current_personality": session.get("personality", "normal"),
        "asked_question_ids": session.get("asked_question_ids", {"theory": [], "coding": []}),
        "current_question_id": session.get("current_question_id"),
        "current_round": session.get("current_round", "theory"),
        "current_time_limit": session.get("current_time_limit", THEORY_TIME_LIMIT),
        "warnings": session.get("warnings", 0),
        "warning_limit": session.get("warning_limit", WARNING_LIMIT),
        "terminated": session.get("terminated", False),
        "termination_reason": session.get("termination_reason"),
        "target_questions": SESSION_TARGET_QUESTIONS,
        "round_breakdown": round_breakdown,
        "status": status,
        "last_warning_reason": session.get("last_warning_reason"),
    }


def reset_session(session_id: str):
    start_session(session_id)
    return sessions[session_id]


def terminate_session(session_id: str, reason: str):
    session = get_or_create_session(session_id)
    session["terminated"] = True
    session["termination_reason"] = reason
    session["current_question_id"] = None
    return session


def register_warning(session_id: str, reason: str):
    session = get_or_create_session(session_id)
    session["warnings"] += 1
    session["last_warning_reason"] = reason

    if session["warnings"] >= session["warning_limit"]:
        terminate_session(session_id, "Stop malpractice during interview.")

    return session


def get_next_question(session=None, personality="normal", round_type="theory"):
    active_personality = personality
    time_limit = TIME_LIMITS[round_type]

    if session:
        if session.get("terminated"):
            return None, None, active_personality, time_limit

        if len(session.get("scores", [])) >= SESSION_TARGET_QUESTIONS:
            return None, None, active_personality, time_limit

        questions = load_questions(round_type)
        asked_ids = set(session.get("asked_question_ids", {}).get(round_type, []))
        available_questions = [question for question in questions if question["id"] not in asked_ids] or questions
        question, difficulty, active_personality = get_adaptive_question(
            available_questions, session, personality
        )
        session["personality"] = active_personality
        session["current_question_id"] = question["id"]
        session["current_round"] = round_type
        session["current_time_limit"] = time_limit
        session["asked_question_ids"][round_type].append(question["id"])
        return question, difficulty, active_personality, time_limit

    questions = load_questions(round_type)
    question = random.choice(questions)
    start_session("user_1")
    sessions["user_1"]["personality"] = personality
    sessions["user_1"]["current_question_id"] = question["id"]
    sessions["user_1"]["current_round"] = round_type
    sessions["user_1"]["current_time_limit"] = time_limit
    sessions["user_1"]["asked_question_ids"][round_type].append(question["id"])
    return question, question["difficulty"], active_personality, time_limit
