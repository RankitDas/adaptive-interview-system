from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel

InterviewPersonality = Literal["friendly", "normal", "strict"]
InterviewRound = Literal["theory", "coding"]
QuestionDifficulty = Literal["easy", "medium", "hard"]


class AnswerRequest(BaseModel):
    question_id: int
    answer: str = ""
    response_time: float
    time_limit: float
    round_type: InterviewRound = "theory"
    code: str = ""
    stdin: str = ""
    compile_stdout: str = ""
    compile_stderr: str = ""
    compiled_successfully: bool = False
    malpractice_count: int = 0


class InterviewReview(BaseModel):
    summary: str
    strengths: List[str]
    problems: List[str]
    improvements: List[str]
    interviewer_note: str
    recommended_next_step: str
    malpractice_note: Optional[str] = None


class SessionSnapshot(BaseModel):
    answered_count: int
    average_score: float
    average_response_time: float
    strengths: List[str]
    focus_areas: List[str]
    recent_scores: List[int]
    completion_rate: float
    recommended_difficulty: str
    current_personality: InterviewPersonality
    asked_question_ids: Dict[str, List[int]]
    current_question_id: Optional[int] = None
    current_round: InterviewRound = "theory"
    current_time_limit: int = 180
    warnings: int = 0
    warning_limit: int = 5
    terminated: bool = False
    termination_reason: Optional[str] = None
    target_questions: int = 5
    round_breakdown: Dict[str, int]
    status: str
    last_warning_reason: Optional[str] = None


class NextQuestionResponse(BaseModel):
    question: Dict[str, Any]
    difficulty: str
    personality: InterviewPersonality
    round_type: InterviewRound
    time_limit: int
    session: SessionSnapshot


class SubmitAnswerResponse(BaseModel):
    features: Dict[str, Any]
    evaluation: Dict[str, Any]
    session_insights: List[str]
    coaching_tip: str
    session: SessionSnapshot
    review: InterviewReview


class SessionActionResponse(BaseModel):
    session: SessionSnapshot
    review: InterviewReview
    terminated: bool
    message: str


class WarningRequest(BaseModel):
    reason: str = "tab-switch"


class TerminateSessionRequest(BaseModel):
    reason: str = "Session terminated by interviewer."


class CompileRequest(BaseModel):
    code: str
    stdin: str = ""


class CompileResponse(BaseModel):
    compiled_successfully: bool
    stdout: str
    stderr: str
    compile_stdout: str
    compile_stderr: str
    exit_code: Optional[int] = None
    timed_out: bool = False
    compiler_available: bool = True
    language: str = "c"


class AtsResponse(BaseModel):
    overall_match: float
    hard_skills_match: float
    skill_alignment_score: float
    content_similarity: float
    semantic_similarity: float
    target_skills: List[str]
    found_skills: List[str]
    missing_skills: List[str]
    matched_skill_count: int
    total_skill_count: int
    skill_source: str
    suggestion: str
    parsed_resume_length: int
    resume_token_count: int
    job_description_token_count: int
    analyzed_resume_tokens: int
    analyzed_job_description_tokens: int
    resume_truncated: bool
    job_description_truncated: bool
    scoring_weights: Dict[str, float]
    semantic_engine: str
    skill_mentions: Dict[str, int]
