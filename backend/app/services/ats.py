import io
import math
import re
from collections import Counter

from fastapi import HTTPException, UploadFile

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was",
    "were", "will", "with", "or", "this", "you", "your",
}

_SEMANTIC_MODEL = None
_SEMANTIC_ENGINE = None


def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text: str):
    return [
        token for token in preprocess(text).split()
        if token and token not in STOPWORDS
    ]


def extract_hard_keywords(text: str, keyword_list: list) -> set:
    found = set()
    lowered_text = text.lower()

    for skill in keyword_list:
        if re.search(r"\b" + re.escape(skill.lower()) + r"\b", lowered_text):
            found.add(skill)

    return found


def _vector_cosine_similarity(left_text: str, right_text: str) -> float:
    left_counter = Counter(tokenize(left_text))
    right_counter = Counter(tokenize(right_text))
    vocabulary = set(left_counter) | set(right_counter)

    if not vocabulary:
        return 0.0

    dot_product = sum(left_counter[token] * right_counter[token] for token in vocabulary)
    left_norm = math.sqrt(sum(value * value for value in left_counter.values()))
    right_norm = math.sqrt(sum(value * value for value in right_counter.values()))

    if left_norm == 0 or right_norm == 0:
        return 0.0

    return dot_product / (left_norm * right_norm)


def _fallback_semantic_similarity(left_text: str, right_text: str) -> float:
    left_tokens = set(tokenize(left_text))
    right_tokens = set(tokenize(right_text))

    if not left_tokens or not right_tokens:
        return 0.0

    overlap = len(left_tokens & right_tokens) / len(left_tokens | right_tokens)
    return overlap


def _load_semantic_model():
    global _SEMANTIC_MODEL
    global _SEMANTIC_ENGINE

    if _SEMANTIC_ENGINE is not None:
        return _SEMANTIC_MODEL, _SEMANTIC_ENGINE

    try:
        from sentence_transformers import SentenceTransformer, util

        _SEMANTIC_MODEL = (SentenceTransformer("all-MiniLM-L6-v2"), util)
        _SEMANTIC_ENGINE = "sentence-transformers"
        return _SEMANTIC_MODEL, _SEMANTIC_ENGINE
    except Exception:
        _SEMANTIC_MODEL = None
        _SEMANTIC_ENGINE = "token-overlap"
        return None, _SEMANTIC_ENGINE


def _semantic_similarity(left_text: str, right_text: str):
    model_bundle, engine = _load_semantic_model()

    if model_bundle is None:
        return _fallback_semantic_similarity(left_text, right_text), engine

    model, util = model_bundle
    left_embedding = model.encode(left_text, convert_to_tensor=True)
    right_embedding = model.encode(right_text, convert_to_tensor=True)
    score = util.pytorch_cos_sim(left_embedding, right_embedding).item()
    return max(score, 0.0), engine


def extract_text_from_pdf(file_bytes: bytes) -> str:
    from PyPDF2 import PdfReader

    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    import docx

    document = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()


async def parse_resume_file(upload: UploadFile) -> str:
    file_bytes = await upload.read()
    filename = (upload.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if filename.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    if filename.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore").strip()

    raise HTTPException(
        status_code=400,
        detail="Unsupported resume format. Upload PDF, DOCX, or TXT.",
    )


def analyze_resume(resume_text: str, job_desc: str, required_skills: list):
    resume_skills = extract_hard_keywords(resume_text, required_skills)
    skills_score = (len(resume_skills) / len(required_skills) * 100) if required_skills else 100.0

    tfidf_score = _vector_cosine_similarity(resume_text, job_desc) * 100
    semantic_score_raw, semantic_engine = _semantic_similarity(resume_text, job_desc)
    semantic_score = semantic_score_raw * 100

    final_score = 0.4 * skills_score + 0.3 * tfidf_score + 0.3 * semantic_score
    missing_skills = sorted(list(set(required_skills) - resume_skills))

    return {
        "overall_match": round(final_score, 2),
        "hard_skills_match": round(skills_score, 2),
        "content_similarity": round(tfidf_score, 2),
        "semantic_similarity": round(semantic_score, 2),
        "found_skills": sorted(list(resume_skills)),
        "missing_skills": missing_skills,
        "suggestion": (
            "Add these missing skills or strengthen them with project evidence."
            if missing_skills else
            "Great match. Tighten impact statements and measurable outcomes for a stronger ATS profile."
        ),
        "parsed_resume_length": len(resume_text),
        "semantic_engine": semantic_engine,
    }
