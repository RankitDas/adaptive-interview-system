import json
import random
from app.core.config import DATA_PATH

def load_questions():
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def get_next_question():
    questions = load_questions()
    return random.choice(questions)