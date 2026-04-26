from pydantic import BaseModel

class AnswerRequest(BaseModel):
    question_id: int
    answer: str
    response_time: float  # seconds