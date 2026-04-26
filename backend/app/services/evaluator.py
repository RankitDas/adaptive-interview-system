def evaluate(features):
    score = 0

    # simple scoring logic
    if features["word_count"] > 10:
        score += 1
    if features["response_time"] < 5:
        score += 1
    if not features["is_short_answer"]:
        score += 1

    return {
        "score": score,
        "feedback": generate_feedback(features)
    }


def generate_feedback(features):
    feedback = []

    if features["is_short_answer"]:
        feedback.append("Your answer is too short. Try to explain more.")

    if features["response_time"] > 5:
        feedback.append("You are taking too long to respond.")

    if features["word_count"] > 10:
        feedback.append("Good detailed response.")

    return feedback