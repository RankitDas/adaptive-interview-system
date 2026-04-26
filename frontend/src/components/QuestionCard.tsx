"use client";

import { useState } from "react";
import Card from "./ui/Card";
import {
  InterviewQuestion,
  InterviewPersonality,
  InterviewRound,
  QuestionDifficulty,
} from "../types";

type QuestionCardProps = {
  difficulty: QuestionDifficulty;
  personality: InterviewPersonality;
  question: InterviewQuestion;
  roundType: InterviewRound;
  elapsed: number;
  remainingTime: number;
  timeLimit: number;
};

function formatTime(value: number) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function QuestionCard({
  difficulty,
  personality,
  question,
  roundType,
  elapsed,
  remainingTime,
  timeLimit,
}: QuestionCardProps) {
  const [copyState, setCopyState] = useState("Copy prompt");
  const timerRatio = Math.max(0, Math.min(100, (remainingTime / timeLimit) * 100));

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(question.question);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy prompt"), 1500);
    } catch {
      setCopyState("Copy failed");
      window.setTimeout(() => setCopyState("Copy prompt"), 1500);
    }
  }

  return (
    <Card className="question-card fade-up">
      <div className="eyebrow-row">
        <span className="eyebrow">Live prompt</span>
        <div className="prompt-meta">
          <span className={`tone-badge tone-${personality}`}>{personality} mode</span>
          <span className="tone-badge">{roundType} round</span>
        </div>
      </div>

      <div className="question-card__header">
        <div>
          <p className="meta-label">Difficulty</p>
          <h2>{difficulty}</h2>
        </div>

        <div className="timer-panel">
          <span>{formatTime(remainingTime)} left</span>
          <small>
            {formatTime(elapsed)} elapsed of {formatTime(timeLimit)}
          </small>
        </div>
      </div>

      <div className="timer-track" aria-hidden="true">
        <span style={{ width: `${timerRatio}%` }} />
      </div>

      <p className="question-copy">{question.question}</p>

      <div className="question-actions">
        <button className="button button-secondary" onClick={copyPrompt} type="button">
          {copyState}
        </button>
        <small className="muted-copy">Question copying is allowed. Answer pasting is blocked.</small>
      </div>

      <div className="question-prompts">
        <div>
          <strong>Recommended approach</strong>
          <span>
            {roundType === "coding"
              ? "State the approach, write the code, compile it, then explain complexity and edge cases."
              : "Lead with a concise answer, explain your reasoning, then anchor it with an example."}
          </span>
        </div>
        <div>
          <strong>What interviewers look for</strong>
          <span>
            {roundType === "coding"
              ? "Correctness, compilation discipline, clean structure, and clear explanation of tradeoffs."
              : "Clarity, confidence, correctness, and how well you prioritize the core idea first."}
          </span>
        </div>
      </div>
    </Card>
  );
}
