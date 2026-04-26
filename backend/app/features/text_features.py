def extract_features(answer: str, response_time: float):
    words = answer.split()
    
    return {
        "word_count": len(words),
        "avg_word_length": sum(len(w) for w in words) / len(words) if words else 0,
        "response_time": response_time,
        "is_short_answer": len(words) < 5
    }