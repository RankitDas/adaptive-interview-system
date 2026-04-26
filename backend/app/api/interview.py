from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.orchestrator import (
    get_next_question,
    get_or_create_session,
    update_session,
    get_session,
    reset_session,
    register_warning,
    summarize_session,
    terminate_session,
)

from app.models.schemas import (
    AnswerRequest,
    AtsResponse,
    CompileRequest,
    CompileResponse,
    NextQuestionResponse,
    SessionActionResponse,
    SubmitAnswerResponse,
    TerminateSessionRequest,
    WarningRequest,
)
from app.features.text_features import extract_features
from app.services.ats import analyze_resume, parse_resume_file
from app.services.compiler import compile_and_run_c
from app.services.evaluator import analyze_session, build_session_review, evaluate

router = APIRouter()
SESSION_ID = "user_1"


@router.get("/next-question", response_model=NextQuestionResponse)
def next_question(personality: str = "normal", round_type: str = "theory"):
    session = get_session(SESSION_ID)

    if session and session.get("terminated"):
        raise HTTPException(status_code=409, detail="Stop malpractice during interview.")

    if session and len(session.get("scores", [])) >= 5:
        raise HTTPException(status_code=409, detail="The session has ended. Review the feedback or reset the interview.")

    question, difficulty, personality, time_limit = get_next_question(
        session, personality, round_type
    )

    if not question:
        raise HTTPException(status_code=409, detail="The session has ended. Review the feedback or reset the interview.")

    return {
        "question": question,
        "difficulty": difficulty,
        "personality": personality,
        "round_type": round_type,
        "time_limit": time_limit,
        "session": summarize_session(get_session(SESSION_ID)),
    }


@router.post("/submit-answer", response_model=SubmitAnswerResponse)
def submit_answer(request: AnswerRequest):
    session = get_or_create_session(SESSION_ID)

    if session.get("terminated"):
        raise HTTPException(status_code=409, detail="Stop malpractice during interview.")

    features = extract_features(
        request.answer,
        request.response_time,
        request.time_limit,
        request.round_type,
        request.code,
        request.compiled_successfully,
        request.compile_stdout,
        request.compile_stderr,
    )

    evaluation = evaluate(features)
    update_session(SESSION_ID, features, evaluation["score"], request.round_type)
    session = get_session(SESSION_ID)

    insights = analyze_session(session)
    review = build_session_review(session)

    if request.round_type == "coding":
        coaching_tip = (
            "Compile early, then use the remaining time to explain complexity and edge cases."
            if evaluation["score"] < 2
            else "The implementation signal is improving. Next, narrate tradeoffs and test cases like a strong candidate."
        )
    else:
        coaching_tip = (
            "Lead with a short summary, then explain your reasoning with one concrete example."
            if evaluation["score"] < 2
            else "Your pacing is solid. Next step: make the answer more memorable with tradeoffs."
        )

    return {
        "features": features,
        "evaluation": evaluation,
        "session_insights": insights,
        "coaching_tip": coaching_tip,
        "session": summarize_session(session),
        "review": review,
    }


@router.post("/reset-session", response_model=SessionActionResponse)
def reset_interview_session():
    session = reset_session(SESSION_ID)
    return {
        "session": summarize_session(session),
        "review": build_session_review(session),
        "terminated": False,
        "message": "Session reset. You can start a fresh interview.",
    }


@router.post("/session-warning", response_model=SessionActionResponse)
def issue_session_warning(request: WarningRequest):
    session = register_warning(SESSION_ID, request.reason)
    terminated = session.get("terminated", False)
    warning_count = session.get("warnings", 0)
    warning_limit = session.get("warning_limit", 5)

    message = (
        "Stop malpractice during interview."
        if terminated else
        f"Warning {warning_count} of {warning_limit}: stay on the interview tab."
    )

    return {
        "session": summarize_session(session),
        "review": build_session_review(session),
        "terminated": terminated,
        "message": message,
    }


@router.post("/terminate-session", response_model=SessionActionResponse)
def terminate_interview_session(request: TerminateSessionRequest):
    session = terminate_session(SESSION_ID, request.reason)
    return {
        "session": summarize_session(session),
        "review": build_session_review(session),
        "terminated": True,
        "message": request.reason,
    }


@router.post("/compile-c", response_model=CompileResponse)
def compile_c_submission(request: CompileRequest):
    return compile_and_run_c(request.code, request.stdin)


@router.get("/session-review", response_model=SessionActionResponse)
def session_review():
    session = get_or_create_session(SESSION_ID)
    return {
        "session": summarize_session(session),
        "review": build_session_review(session),
        "terminated": session.get("terminated", False),
        "message": "Current interviewer review.",
    }


@router.post("/ats/evaluate", response_model=AtsResponse)
async def evaluate_resume(
    job_description: str = Form(...),
    required_skills: str = Form(""),
    resume_text: str = Form(""),
    resume_file: Optional[UploadFile] = File(default=None),
):
    parsed_resume_text = resume_text.strip()

    if resume_file is not None and resume_file.filename:
        parsed_resume_text = await parse_resume_file(resume_file)

    if not parsed_resume_text:
        raise HTTPException(status_code=400, detail="Provide either resume text or a resume file.")

    skills = [
        skill.strip() for skill in required_skills.split(",")
        if skill.strip()
    ]

    return analyze_resume(parsed_resume_text, job_description, skills)
