import json
import random
from app.core.config import DATA_PATH

# ------------------------------
# Question Handling
# ------------------------------

def load_questions():
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def get_next_question():
    questions = load_questions()
    return random.choice(questions)

# ------------------------------
# Session Handling (in-memory)
# ------------------------------

sessions = {}

def start_session(session_id: str):
    sessions[session_id] = {
        "answers": [],
        "scores": []
    }

def update_session(session_id: str, features, score):
    if session_id not in sessions:
        start_session(session_id)

    sessions[session_id]["answers"].append(features)
    sessions[session_id]["scores"].append(score)

def get_session(session_id: str):
    return sessions.get(session_id, None)