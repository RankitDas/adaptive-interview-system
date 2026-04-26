def _average(values):
    return sum(values) / len(values) if values else 0.0


def evaluate(features):
    if features.get("round_type") == "coding":
        return _evaluate_coding(features)

    return _evaluate_theory(features)


def _evaluate_theory(features):
    score = 0
    feedback = []

    if features["word_count"] >= 20:
        score += 1
        feedback.append("You gave enough detail to sound considered rather than rushed.")
    else:
        feedback.append("Your answer is still too short. Build it with definition, reasoning, and one example.")

    if features["response_time"] <= features["time_limit"]:
        score += 1
    else:
        feedback.append("You ran over the time limit. Tighten the opening and prioritize the core idea first.")

    if not features["under_pressure"]:
        score += 1
        feedback.append("Your pacing stayed under control.")
    else:
        feedback.append("You sounded pressured near the end. Slow the first sentence and structure the answer sooner.")

    return {"score": score, "feedback": feedback}


def _evaluate_coding(features):
    score = 0
    feedback = []

    if features["code_length"] >= 120 or features["line_count"] >= 8:
        score += 1
        feedback.append("You submitted enough code to show a concrete solution path.")
    else:
        feedback.append("The coding submission is too thin. Write a fuller solution before submitting.")

    if features.get("compiled_successfully"):
        score += 1
        feedback.append("Your code compiled successfully, which is a strong baseline signal.")
    else:
        feedback.append("The code did not compile cleanly. Fix compile errors before you submit in a real round.")

    if features["response_time"] <= features["time_limit"]:
        score += 1
    else:
        feedback.append("You exceeded the coding timer. Break the problem into steps earlier.")

    if not features.get("has_explanation"):
        feedback.append("Add a short written explanation covering approach, complexity, and edge cases.")

    return {"score": score, "feedback": feedback}


def analyze_session(session):
    if not session:
        return []

    insights = []
    answers = session["answers"]
    scores = session["scores"]

    theory_answers = [answer for answer in answers if answer.get("round_type") == "theory"]
    coding_answers = [answer for answer in answers if answer.get("round_type") == "coding"]

    avg_score = _average(scores)
    avg_pressure = _average([answer["pressure_ratio"] for answer in answers])

    if theory_answers:
        avg_words = _average([answer["word_count"] for answer in theory_answers])
        if avg_words < 18:
            insights.append("Theory answers are still brief. Expand each answer with reasoning and one concrete example.")

    if coding_answers:
        compile_rate = _average([
            1.0 if answer.get("compiled_successfully") else 0.0
            for answer in coding_answers
        ])
        if compile_rate < 0.5:
            insights.append("Coding submissions are not compiling reliably yet. Run and verify before final submission.")

    if avg_pressure > 0.8:
        insights.append("You are consistently finishing close to the timer. Improve structure sooner.")

    if session.get("warnings", 0) > 0:
        insights.append("Tab-switch warnings were recorded. Maintain interview discipline throughout the session.")

    if avg_score < 2:
        insights.append("Overall performance is below target. Focus on clarity, completeness, and calmer pacing.")

    return insights or [
        "Session insights will become more precise as you complete more mixed-round questions."
    ]


def build_session_review(session):
    if not session:
        return {
            "summary": "No completed interview data yet.",
            "strengths": ["Start a session to generate interviewer-style feedback."],
            "problems": ["No answer history is available yet."],
            "improvements": ["Complete a few theory or coding questions first."],
            "interviewer_note": "I need more signal before giving a hiring-style view.",
            "recommended_next_step": "Start with one theory question and one coding question.",
            "malpractice_note": None,
        }

    answers = session["answers"]
    scores = session["scores"]
    avg_score = _average(scores)
    avg_pressure = _average([answer["pressure_ratio"] for answer in answers])
    theory_answers = [answer for answer in answers if answer.get("round_type") == "theory"]
    coding_answers = [answer for answer in answers if answer.get("round_type") == "coding"]

    strengths = []
    problems = []
    improvements = []

    if theory_answers and _average([answer["word_count"] for answer in theory_answers]) >= 22:
        strengths.append("Theory responses had enough depth to support follow-up discussion.")
    if coding_answers and _average([
        1.0 if answer.get("compiled_successfully") else 0.0 for answer in coding_answers
    ]) >= 0.5:
        strengths.append("At least part of the coding work compiled, which shows workable implementation discipline.")
    if avg_score >= 2.25:
        strengths.append("The overall scoring trend is strong enough to keep the interview moving positively.")

    if theory_answers and _average([answer["word_count"] for answer in theory_answers]) < 18:
        problems.append("Theory answers were often too short and missed full reasoning.")
        improvements.append("Use a three-part structure: answer, explanation, example.")

    if coding_answers and _average([
        1.0 if answer.get("compiled_successfully") else 0.0 for answer in coding_answers
    ]) < 0.5:
        problems.append("Coding submissions were not reliably compiling.")
        improvements.append("Compile before final submission and test basic edge cases.")

    if avg_pressure > 0.8:
        problems.append("Time pressure affected the end of your responses.")
        improvements.append("Spend less time setting up and get to the core idea within the first 20 to 30 seconds.")

    if session.get("warnings", 0) > 0:
        problems.append("Interview discipline was affected by tab switching.")
        improvements.append("Stay in the interview tab throughout the session to avoid automatic termination.")

    if not strengths:
        strengths.append("You are building useful baseline data for the next interview round.")
    if not problems:
        problems.append("No major red flags appeared in the current session.")
    if not improvements:
        improvements.append("Keep practicing mixed theory and coding rounds to improve consistency.")

    if avg_score >= 2.5:
        summary = "This was a solid interview showing good control, but there is still room to sharpen polish and consistency."
        interviewer_note = "I would keep this candidate moving and probe deeper on complexity, tradeoffs, and edge cases."
    elif avg_score >= 1.5:
        summary = "The session showed workable fundamentals, but the performance is not yet consistently interview-ready."
        interviewer_note = "I would continue the interview, but I would want stronger structure and cleaner execution."
    else:
        summary = "The session exposed gaps in clarity, execution, or discipline that would concern an interviewer."
        interviewer_note = "I would be hesitant to move forward without clearer fundamentals and calmer delivery."

    malpractice_note = None
    if session.get("terminated"):
        malpractice_note = session.get("termination_reason") or "Stop malpractice during interview."
        interviewer_note = "The session was terminated because interview integrity rules were broken."

    return {
        "summary": summary,
        "strengths": strengths,
        "problems": problems,
        "improvements": improvements,
        "interviewer_note": interviewer_note,
        "recommended_next_step": improvements[0],
        "malpractice_note": malpractice_note,
    }
