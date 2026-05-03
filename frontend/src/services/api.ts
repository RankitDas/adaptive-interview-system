const API_BASE_URL = "https://adaptive-interview-system.onrender.com";

// simple clean fetch
async function request(path: string, options?: RequestInit) {
  try {
    const res = await fetch(API_BASE_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("API error");
    }

    return await res.json();
  } catch (err) {
    console.error("ERROR:", err);
    throw new Error("Backend connection failed");
  }
}

// ================= API =================

export function fetchNextQuestion(personality: string, roundType: string) {
  return request(
    `/next-question?personality=${personality}&round_type=${roundType}`
  );
}

export function submitAnswer(data: any) {
  return request("/submit-answer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resetSession() {
  return request("/reset-session", { method: "POST" });
}

export function getSessionReview() {
  return request("/session-review");
}