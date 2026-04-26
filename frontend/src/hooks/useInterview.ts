"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  compileC,
  fetchNextQuestion,
  getSessionReview,
  issueSessionWarning,
  resetSession,
  submitAnswer,
} from "../services/api";
import {
  CompileResponse,
  InterviewMode,
  InterviewPersonality,
  InterviewReview,
  InterviewRound,
  NextQuestionResponse,
  SessionSnapshot,
  StoredSessionReport,
  SubmitAnswerResponse,
} from "../types";

const SESSION_STORAGE_KEY = "adaptive-interview:last-session";

const starterCode = `#include <stdio.h>

int main(void) {
    // Write your C solution here.
    return 0;
}
`;

const emptyReview: InterviewReview = {
  summary: "No session review yet.",
  strengths: ["Complete a few questions to unlock an interviewer-style review."],
  problems: ["No interview data is available yet."],
  improvements: ["Start with one theory question or one coding question."],
  interviewer_note: "I need more evidence before making a hiring-style judgment.",
  recommended_next_step: "Start a session and answer the prompt in your own words.",
  malpractice_note: null,
};

const emptySession: SessionSnapshot = {
  answered_count: 0,
  average_score: 0,
  average_response_time: 0,
  strengths: ["Fresh session ready. Start with a focused and structured answer."],
  focus_areas: ["Keep answers original, stay on the tab, and manage time deliberately."],
  recent_scores: [],
  completion_rate: 0,
  recommended_difficulty: "easy",
  current_personality: "normal",
  asked_question_ids: { theory: [], coding: [] },
  current_question_id: null,
  current_round: "theory",
  current_time_limit: 180,
  warnings: 0,
  warning_limit: 5,
  terminated: false,
  termination_reason: null,
  target_questions: 5,
  round_breakdown: { theory: 0, coding: 0 },
  status: "ready",
  last_warning_reason: null,
};

function buildStoredReport(
  session: SessionSnapshot,
  review: InterviewReview,
  message: string | null,
  latestRound?: InterviewRound,
  response?: SubmitAnswerResponse | null,
): StoredSessionReport {
  return {
    session,
    review,
    message,
    coaching_tip: response?.coaching_tip,
    session_insights: response?.session_insights,
    evaluation: response?.evaluation ?? null,
    latest_round: latestRound,
  };
}

export function useInterview() {
  const [questionResponse, setQuestionResponse] = useState<NextQuestionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [roundType, setRoundType] = useState<InterviewRound>("theory");
  const [personality, setPersonality] = useState<InterviewPersonality>("normal");
  const [mode, setMode] = useState<InterviewMode>("text");
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [review, setReview] = useState<InterviewReview>(emptyReview);
  const [session, setSession] = useState<SessionSnapshot>(emptySession);
  const [elapsed, setElapsed] = useState(0);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [compilerResult, setCompilerResult] = useState<CompileResponse | null>(null);
  const warningInFlightRef = useRef(false);
  const activeRound = questionResponse?.round_type ?? roundType;

  const currentTimeLimit =
    questionResponse?.time_limit ??
    session.current_time_limit ??
    (activeRound === "coding" ? 900 : 180);

  useEffect(() => {
    if (!isSessionActive) {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredSessionReport;
      setSession(parsed.session);
      setReview(parsed.review);
      setSessionMessage(parsed.message ?? null);
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!sessionMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSessionMessage((current) =>
        current?.includes("malpractice") ? current : null,
      );
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [sessionMessage]);

  useEffect(() => {
    if (!isSessionActive || !questionResponse || session.terminated) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "hidden" || warningInFlightRef.current) {
        return;
      }

      warningInFlightRef.current = true;

      try {
        const response = await issueSessionWarning("tab-switch");

        startTransition(() => {
          setSession(response.session);
          setReview(response.review);
          setSessionMessage(response.message);
        });

        if (response.terminated) {
          startTransition(() => {
            setIsSessionActive(false);
            setQuestionResponse(null);
          });

          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(
              buildStoredReport(response.session, response.review, response.message, activeRound),
            ),
          );
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to record the tab-switch warning.",
        );
      } finally {
        window.setTimeout(() => {
          warningInFlightRef.current = false;
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeRound, isSessionActive, questionResponse, session.terminated]);

  useEffect(() => {
    if (roundType === "coding" && !questionResponse) {
      setCode(starterCode);
    }
  }, [roundType, questionResponse]);

  const answerMetrics = useMemo(() => {
    const words = answer.trim().split(/\s+/).filter(Boolean);
    const codeLines = code.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const remainingTime = Math.max(0, currentTimeLimit - elapsed);
    const pressureRatio = currentTimeLimit > 0 ? remainingTime / currentTimeLimit : 0;

    const estimatedScore =
      activeRound === "coding"
        ? Math.min(
            100,
            Math.max(
              16,
              codeLines.length * 8
                + (compilerResult?.compiled_successfully ? 18 : 0)
                + (answer.trim() ? 8 : 0),
            ),
          )
        : Math.min(100, Math.max(12, words.length * 2.8));

    return {
      wordCount: words.length,
      lineCount: codeLines.length,
      estimatedScore,
      remainingTime,
      pressureLevel:
        pressureRatio < 0.15 ? "high" : pressureRatio < 0.4 ? "medium" : "calm",
    };
  }, [activeRound, answer, code, compilerResult, currentTimeLimit, elapsed]);

  async function beginInterview(selectedPersonality = personality, selectedRound = roundType) {
    setIsLoadingQuestion(true);
    setError(null);
    setSessionMessage(null);

    try {
      const next = await fetchNextQuestion(selectedPersonality, selectedRound);

      startTransition(() => {
        setQuestionResponse(next);
        setRoundType(next.round_type);
        setSession(next.session);
        setResult(null);
        setAnswer("");
        setElapsed(0);
        setCompilerResult(null);
        setIsSessionActive(true);
        setMode("text");

        if (next.round_type === "coding") {
          setCode(starterCode);
          setStdin("");
        }
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the next question.";

      setError(message);

      if (
        message.toLowerCase().includes("session has ended") ||
        message.toLowerCase().includes("malpractice")
      ) {
        try {
          const reviewResponse = await getSessionReview();

          startTransition(() => {
            setSession(reviewResponse.session);
            setReview(reviewResponse.review);
            setSessionMessage(reviewResponse.message);
            setQuestionResponse(null);
            setIsSessionActive(false);
          });

          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(
              buildStoredReport(
                reviewResponse.session,
                reviewResponse.review,
                reviewResponse.message,
                selectedRound,
              ),
            ),
          );
        } catch {
          // Keep the original error when the review fetch also fails.
        }
      }
    } finally {
      setIsLoadingQuestion(false);
    }
  }

  async function compileCurrentCode() {
    if (!code.trim()) {
      setSessionMessage("Write your own code before compiling.");
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      const response = await compileC(code, stdin);

      startTransition(() => {
        setCompilerResult(response);
        setSessionMessage(
          response.compiled_successfully
            ? "Compilation succeeded. Review the output before submitting."
            : "Compilation failed. Fix the compiler errors before submitting.",
        );
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to compile the C submission.",
      );
    } finally {
      setIsCompiling(false);
    }
  }

  async function submitCurrentAnswer() {
    const hasTheoryAnswer = activeRound === "theory" && answer.trim().length > 0;
    const hasCodingAnswer = activeRound === "coding" && code.trim().length > 0;

    if (!questionResponse?.question || (!hasTheoryAnswer && !hasCodingAnswer)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitAnswer({
        question_id: questionResponse.question.id,
        answer,
        response_time: elapsed,
        time_limit: currentTimeLimit,
        round_type: activeRound,
        code,
        stdin,
        compile_stdout: compilerResult?.compile_stdout ?? "",
        compile_stderr: compilerResult?.compile_stderr ?? "",
        compiled_successfully: compilerResult?.compiled_successfully ?? false,
        malpractice_count: session.warnings,
      });

      const report = buildStoredReport(
        response.session,
        response.review,
        response.session.status === "completed"
          ? "Session completed. Review the interviewer feedback."
          : response.coaching_tip,
        activeRound,
        response,
      );

      startTransition(() => {
        setResult(response);
        setSession(response.session);
        setReview(response.review);
        setIsSessionActive(false);
        setSessionMessage(report.message ?? null);
      });

      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(report));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Answer submission failed. Check that the API is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetInterview() {
    setError(null);

    try {
      const response = await resetSession();

      startTransition(() => {
        setQuestionResponse(null);
        setAnswer("");
        setCode(starterCode);
        setStdin("");
        setElapsed(0);
        setResult(null);
        setReview(response.review);
        setCompilerResult(null);
        setIsSessionActive(false);
        setSession(response.session);
        setSessionMessage(response.message);
        setRoundType("theory");
      });

      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset the session right now.",
      );
    }
  }

  function reportPasteBlocked() {
    setSessionMessage("Pasting is disabled during the interview. Type the answer yourself.");
  }

  return {
    answer,
    answerMetrics,
    code,
    compilerResult,
    currentTimeLimit,
    elapsed,
    error,
    isCompiling,
    isLoadingQuestion,
    isSessionActive,
    isSubmitting,
    mode,
    personality,
    questionResponse,
    result,
    review,
    roundType,
    session,
    sessionMessage,
    stdin,
    setAnswer,
    setCode,
    setMode,
    setPersonality,
    setRoundType,
    setStdin,
    beginInterview,
    compileCurrentCode,
    reportPasteBlocked,
    resetInterview,
    submitCurrentAnswer,
  };
}
