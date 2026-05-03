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

const API_BASE_URL = "https://adaptive-interview-system.onrender.com";

// ================= CORE REQUEST (WITH RETRY) =================
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(API_BASE_URL + path, {
        ...options,
        headers: options?.body instanceof FormData
          ? options.headers
          : {
              "Content-Type": "application/json",
              ...(options?.headers || {}),
            },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === 1) {
        console.error("API ERROR:", err);
        throw new Error("Backend connection failed");
      }

      // wait 2 sec then retry (handles Render sleep)
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("Unexpected error");
}

// ================= INTERVIEW =================

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

export function getSessionReview() {
  return request<SessionActionResponse>("/session-review");
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

// ================= EXTRA FEATURES =================

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