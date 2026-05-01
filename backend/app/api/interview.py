import logging
import re
import uuid
from typing import Optional

from fastapi import APIRouter, Cookie, File, Form, HTTPException, Response, UploadFile

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter()

def ensure_session_id(response: Response, session_id: Optional[str]) -> str:
    """Get or create a session ID and persist it for browser API calls."""
    if not session_id:
        session_id = f"user_{uuid.uuid4().hex[:12]}"
        logger.info(f"Created new session: {session_id}")

    response.set_cookie(
        "session_id",
        session_id,
        max_age=86400,
        httponly=True,
        samesite="lax",
    )
    return session_id


@router.get("/next-question", response_model=NextQuestionResponse)
def next_question(
    response: Response,
    personality: str = "normal", 
    round_type: str = "theory",
    session_id: str = Cookie(default=None)
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = get_or_create_session(session_id)

        if session and session.get("terminated"):
            logger.warning(f"Session {session_id} already terminated")
            raise HTTPException(status_code=409, detail="Stop malpractice during interview.")

        if session and len(session.get("scores", [])) >= 5:
            logger.info(f"Session {session_id} completed - 5 questions answered")
            raise HTTPException(status_code=409, detail="The session has ended. Review the feedback or reset the interview.")

        question, difficulty, personality, time_limit = get_next_question(
            session, personality, round_type
        )

        if not question:
            logger.warning(f"No questions available for session {session_id}")
            raise HTTPException(status_code=409, detail="The session has ended. Review the feedback or reset the interview.")

        logger.info(f"Session {session_id}: Serving {round_type} question (difficulty: {difficulty})")

        return {
            "question": question,
            "difficulty": difficulty,
            "personality": personality,
            "round_type": round_type,
            "time_limit": time_limit,
            "session": summarize_session(get_session(session_id)),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in next_question for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/submit-answer", response_model=SubmitAnswerResponse)
def submit_answer(
    request: AnswerRequest,
    response: Response,
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = get_or_create_session(session_id)

        if session.get("terminated"):
            logger.warning(f"Session {session_id} terminated - rejecting answer")
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
        update_session(session_id, features, evaluation["score"], request.round_type)
        session = get_session(session_id)

        insights = analyze_session(session)
        review = build_session_review(session)
        
        logger.info(f"Session {session_id}: Answer submitted for {request.round_type} (score: {evaluation['score']})")

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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in submit_answer for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/reset-session", response_model=SessionActionResponse)
def reset_interview_session(
    response: Response,
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = reset_session(session_id)
        logger.info(f"Session {session_id} reset")
        
        return {
            "session": summarize_session(session),
            "review": build_session_review(session),
            "terminated": False,
            "message": "Session reset. You can start a fresh interview.",
        }
    except Exception as e:
        logger.error(f"Error in reset_interview_session for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/session-warning", response_model=SessionActionResponse)
def issue_session_warning(
    request: WarningRequest,
    response: Response,
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = register_warning(session_id, request.reason)
        terminated = session.get("terminated", False)
        warning_count = session.get("warnings", 0)
        warning_limit = session.get("warning_limit", 5)
        
        logger.warning(f"Session {session_id}: Warning {warning_count}/{warning_limit} - {request.reason}")

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
    except Exception as e:
        logger.error(f"Error in issue_session_warning for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/terminate-session", response_model=SessionActionResponse)
def terminate_interview_session(
    request: TerminateSessionRequest,
    response: Response,
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = terminate_session(session_id, request.reason)
        logger.warning(f"Session {session_id} terminated: {request.reason}")
        
        return {
            "session": summarize_session(session),
            "review": build_session_review(session),
            "terminated": True,
            "message": request.reason,
        }
    except Exception as e:
        logger.error(f"Error in terminate_interview_session for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/compile-c", response_model=CompileResponse)
def compile_c_submission(request: CompileRequest, session_id: str = Cookie(default=None)):
    try:
        logger.info(f"Session {session_id}: Compiling C code")
        return compile_and_run_c(request.code, request.stdin)
    except Exception as e:
        logger.error(f"Error in compile_c_submission for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Compilation error")


@router.get("/session-review", response_model=SessionActionResponse)
def session_review(
    response: Response,
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        session = get_or_create_session(session_id)
        logger.info(f"Session {session_id} review requested")
        
        return {
            "session": summarize_session(session),
            "review": build_session_review(session),
            "terminated": session.get("terminated", False),
            "message": "Current interviewer review.",
        }
    except Exception as e:
        logger.error(f"Error in session_review for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/ats/evaluate", response_model=AtsResponse)
async def evaluate_resume(
    response: Response,
    job_description: str = Form(...),
    required_skills: str = Form(""),
    resume_text: str = Form(""),
    resume_file: Optional[UploadFile] = File(default=None),
    session_id: str = Cookie(default=None),
):
    try:
        session_id = ensure_session_id(response, session_id)
        logger.info(f"Session {session_id}: ATS evaluation requested")
        
        parsed_resume_text = resume_text.strip()

        if resume_file is not None and resume_file.filename:
            parsed_resume_text = await parse_resume_file(resume_file)

        if not parsed_resume_text:
            logger.warning(f"Session {session_id}: No resume text provided")
            raise HTTPException(status_code=400, detail="Provide either resume text or a resume file.")

        skills = [
            skill.strip()
            for skill in re.split(r"[\n,;|]+", required_skills)
            if skill.strip()
        ]

        logger.info(f"Session {session_id}: Evaluating resume with {len(skills)} required skills")
        
        return analyze_resume(parsed_resume_text, job_description, skills)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in evaluate_resume for session {session_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Resume evaluation error")
