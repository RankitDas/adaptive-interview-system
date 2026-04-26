# ------------------------------
# Individual Answer Evaluation
# ------------------------------

def evaluate(features):
    score = 0
    feedback = []

    if features["word_count"] > 10:
        score += 1
        feedback.append("Good detailed response.")

    if features["response_time"] < 5:
        score += 1
    else:
        feedback.append("You are taking too long to respond.")

    if not features["is_short_answer"]:
        score += 1
    else:
        feedback.append("Your answer is too short. Try to explain more.")

    return {
        "score": score,
        "feedback": feedback
    }

# ------------------------------
# Session-Level Analysis
# ------------------------------

def analyze_session(session):
    if not session:
        return []

    insights = []

    answers = session["answers"]
    scores = session["scores"]

    avg_words = sum(a["word_count"] for a in answers) / len(answers)
    avg_time = sum(a["response_time"] for a in answers) / len(answers)
    avg_score = sum(scores) / len(scores)

    if avg_words < 8:
        insights.append("You consistently give short answers. Try elaborating more.")

    if avg_time > 5:
        insights.append("You take longer to respond, indicating hesitation.")

    if avg_score < 2:
        insights.append("Your overall performance is low. Focus on clarity and structure.")

    return insights