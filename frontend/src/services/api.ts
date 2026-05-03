import {
  AtsResponse,
  CompileResponse,
  InterviewPersonality,
  InterviewRound,
  NextQuestionResponse,
  SessionActionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "../types";

// 🔥 HARD CODED BACKEND URL (no env issues)
const API_BASE_URL = "https://adaptive-interview-system.onrender.com";

// ✅ Simple clean request function
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      mode: "cors",
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Backend connection failed");
  }
}

/* ================= API ================= */

export function fetchNextQuestion(
  personality: InterviewPersonality,
  roundType: InterviewRound
) {
  return request<NextQuestionResponse>(
    `/next-question?personality=${encodeURIComponent(personality)}&round_type=${encodeURIComponent(roundType)}`
  );
}

export function submitAnswer(payload: SubmitAnswerRequest) {
  return request<SubmitAnswerResponse>("/submit-answer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetSession() {
  return request<SessionActionResponse>("/reset-session", {
    method: "POST",
  });
}

export function issueSessionWarning(reason: string) {
  return request<SessionActionResponse>("/session-warning", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function terminateSession(reason: string) {
  return request<SessionActionResponse>("/terminate-session", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function getSessionReview() {
  return request<SessionActionResponse>("/session-review");
}

export function compileC(code: string, stdin = "") {
  return request<CompileResponse>("/compile-c", {
    method: "POST",
    body: JSON.stringify({ code, stdin }),
  });
}

export function evaluateResume(formData: FormData) {
  return request<AtsResponse>("/ats/evaluate", {
    method: "POST",
    body: formData,
  });
}