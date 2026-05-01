import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
DATA_DIR = os.path.join(BASE_DIR, "data")
LOCAL_PACKAGES_PATH = os.path.join(BACKEND_DIR, ".packages")

THEORY_QUESTIONS_PATH = os.path.join(DATA_DIR, "questions.json")
CODING_QUESTIONS_PATH = os.path.join(DATA_DIR, "coding_questions.json")
JOB_ROLES_PATH = os.path.join(DATA_DIR, "job_roles.json")

SESSION_TARGET_QUESTIONS = 5
THEORY_TIME_LIMIT = 180
CODING_TIME_LIMIT = 900
WARNING_LIMIT = 5


def bootstrap_local_packages():
    if os.path.isdir(LOCAL_PACKAGES_PATH) and LOCAL_PACKAGES_PATH not in sys.path:
        sys.path.append(LOCAL_PACKAGES_PATH)
