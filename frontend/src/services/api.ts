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

/**
 * ✅ API base URL (uses Vercel env, fallback to Render)
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://adaptive-interview-system.onrender.com";

/**
 * Simple error normalizer
 */
function normalizeApiError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "Backend is waking up or unreachable. Please wait a few seconds and try again.";
  }

  return message;
}

/**
 * ✅ CLEAN request function (no credentials, proper CORS mode)
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: isFormData
        ? init?.headers
        : {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
          },
      mode: "cors",
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error(
      normalizeApiError(
        err instanceof Error ? err.message : "Network error"
      )
    );
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