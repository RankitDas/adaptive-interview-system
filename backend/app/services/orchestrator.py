import json
import random

def load_questions():
    with open("../../data/questions.json", "r") as f:
        return json.load(f)

def get_next_question():
    questions = load_questions()
    return random.choice(questions)