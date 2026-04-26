def extract_features(
    answer: str,
    response_time: float,
    time_limit: float,
    round_type: str = "theory",
    code: str = "",
    compiled_successfully: bool = False,
    compile_stdout: str = "",
    compile_stderr: str = "",
):
    words = answer.split()
    word_count = len(words)
    code_lines = [line for line in code.splitlines() if line.strip()]
    line_count = len(code_lines)

    avg_word_length = (
        sum(len(w) for w in words) / word_count
        if word_count > 0 else 0
    )

    pressure_ratio = response_time / time_limit if time_limit > 0 else 1

    return {
        "word_count": word_count,
        "avg_word_length": avg_word_length,
        "response_time": response_time,
        "time_limit": time_limit,
        "pressure_ratio": pressure_ratio,
        "is_short_answer": word_count < 5,
        "under_pressure": pressure_ratio > 0.8,
        "round_type": round_type,
        "code_length": len(code),
        "line_count": line_count,
        "compiled_successfully": compiled_successfully,
        "compile_attempted": bool(code.strip() or compile_stdout or compile_stderr),
        "compile_stdout": compile_stdout,
        "compile_stderr": compile_stderr,
        "has_explanation": word_count >= 12,
    }
