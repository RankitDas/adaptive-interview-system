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
 * ✅ FINAL BASE URL FIX
 * Uses env if available, otherwise falls back to production backend
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://adaptive-interview-system.onrender.com";

/**
 * Normalize user-facing errors
 */
function normalizeApiError(message: string, status: number, path: string) {
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "Backend unreachable. It may be waking up (Render free tier). Please wait a few seconds and try again.";
  }

  if (status >= 500) {
    if (path.includes("compile")) {
      return "Compiler error. Please check your code.";
    }

    if (path.includes("ats")) {
      return "Resume analysis failed. Try a smaller input.";
    }

    return "Server error. Please try again.";
  }

  if (lower.includes("request failed with status")) {
    return "Request failed. Please check your input.";
  }

  return message;
}

/**
 * Core request wrapper
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: isFormData
        ? init?.headers
        : {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
          },
      cache: "no-store",
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const data = await response.json();
        message = data?.detail || message;
      } catch {
        // ignore JSON parse error
      }

      throw new Error(normalizeApiError(message, response.status, path));
    }

    return response.json();
  } catch (err) {
    throw new Error(
      normalizeApiError(
        err instanceof Error ? err.message : "Network error",
        0,
        path
      )
    );
  }
}

/**
 * ======================
 * API FUNCTIONS
 * ======================
 */

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