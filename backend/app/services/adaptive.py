import random

def decide_difficulty(session):
    if not session or len(session["scores"]) == 0:
        return "easy"

    avg_score = sum(session["scores"]) / len(session["scores"])

    if avg_score <= 1:
        return "easy"
    elif avg_score == 2:
        return "medium"
    else:
        return "hard"


def apply_personality(difficulty, personality):
    if personality == "strict":
        if difficulty == "medium":
            return "hard"
        if difficulty == "easy":
            return "medium"

    elif personality == "friendly":
        if difficulty == "hard":
            return "medium"
        if difficulty == "medium":
            return "easy"

    return difficulty


def filter_questions_by_difficulty(questions, difficulty):
    return [q for q in questions if q["difficulty"] == difficulty]


def get_adaptive_question(questions, session, personality="normal"):
    base_difficulty = decide_difficulty(session)
    final_difficulty = apply_personality(base_difficulty, personality)

    filtered = filter_questions_by_difficulty(questions, final_difficulty)

    if not filtered:
        return random.choice(questions), final_difficulty, personality

    return random.choice(filtered), final_difficulty, personality