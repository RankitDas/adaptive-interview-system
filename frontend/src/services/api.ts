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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function normalizeApiError(message: string, status: number, path: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("token") ||
    lowerMessage.includes("context length") ||
    lowerMessage.includes("maximum context") ||
    lowerMessage.includes("too many")
  ) {
    return "That input is very large. The app will safely analyze the most relevant content, but please try again with the key resume and job sections if this continues.";
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("networkerror")
  ) {
    return "Cannot reach the backend right now. Start the API server, then try again.";
  }

  if (status >= 500) {
    if (path.includes("compile")) {
      return "The compiler could not run that request. Review the code and try again.";
    }

    if (path.includes("ats")) {
      return "The resume checker could not finish this analysis. Shorten the input to the most relevant sections and try again.";
    }

    return "Something went wrong while processing the request. Please try again.";
  }

  if (lowerMessage.includes("request failed with status")) {
    return "The request could not be completed. Please check the form and try again.";
  }

  return message;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: isFormData
        ? init?.headers
        : {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      normalizeApiError(
        error instanceof Error ? error.message : "Network request failed.",
        0,
        path,
      ),
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      message = Array.isArray(payload.detail)
        ? "Please check the required fields and try again."
        : payload.detail ?? message;
    } catch {
      // Keep default message when the error body is not JSON.
    }

    throw new Error(normalizeApiError(message, response.status, path));
  }

  return response.json();
}

export function fetchNextQuestion(
  personality: InterviewPersonality,
  roundType: InterviewRound,
) {
  return request<NextQuestionResponse>(
    `/next-question?personality=${encodeURIComponent(personality)}&round_type=${encodeURIComponent(roundType)}`,
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
