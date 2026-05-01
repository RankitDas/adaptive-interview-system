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

// ✅ Uses env in Vercel, falls back to Render URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://adaptive-interview-system.onrender.com";

function normalizeApiError(message: string, status: number, path: string) {
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "Backend may be waking up (Render). Please wait a few seconds and try again.";
  }

  if (status >= 500) {
    if (path.includes("compile")) return "Compiler error. Check your code.";
    if (path.includes("ats")) return "Resume analysis failed. Try smaller input.";
    return "Server error. Please try again.";
  }

  return message;
}

// ✅ Retry once (handles Render cold start)
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: isFormData
          ? init?.headers
          : {
              "Content-Type": "application/json",
              ...(init?.headers || {}),
            },
        cache: "no-store",
      });

      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          msg = data?.detail || msg;
        } catch {}
        throw new Error(normalizeApiError(msg, res.status, path));
      }

      return res.json();
    } catch (err) {
      if (attempt === 1) {
        throw new Error(
          normalizeApiError(
            err instanceof Error ? err.message : "Network error",
            0,
            path
          )
        );
      }
      // wait 2s then retry
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("Unexpected error");
}

/* ===== API functions ===== */

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