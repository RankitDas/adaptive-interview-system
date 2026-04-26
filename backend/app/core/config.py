import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
DATA_DIR = os.path.join(BASE_DIR, "data")
LOCAL_PACKAGES_PATH = os.path.join(BACKEND_DIR, ".packages")

THEORY_QUESTIONS_PATH = os.path.join(DATA_DIR, "questions.json")
CODING_QUESTIONS_PATH = os.path.join(DATA_DIR, "coding_questions.json")

SESSION_TARGET_QUESTIONS = 5
THEORY_TIME_LIMIT = 180
CODING_TIME_LIMIT = 900
WARNING_LIMIT = 5


def bootstrap_local_packages():
    if os.path.isdir(LOCAL_PACKAGES_PATH) and LOCAL_PACKAGES_PATH not in sys.path:
        sys.path.insert(0, LOCAL_PACKAGES_PATH)
