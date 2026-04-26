def extract_features(answer: str, response_time: float):
    words = answer.split()

    word_count = len(words)

    avg_word_length = (
        sum(len(w) for w in words) / word_count
        if word_count > 0 else 0
    )

    return {
        "word_count": word_count,
        "avg_word_length": avg_word_length,
        "response_time": response_time,
        "is_short_answer": word_count < 5
    }