"use client";

import { KeyboardEvent } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { InterviewMode } from "../types";

type AnswerBoxProps = {
  answer: string;
  estimatedScore: number;
  isLocked: boolean;
  isSubmitting: boolean;
  mode: InterviewMode;
  onAnswerChange: (value: string) => void;
  onModeChange: (value: InterviewMode) => void;
  onPasteBlocked: () => void;
  onSubmit: () => void;
  wordCount: number;
};

export default function AnswerBox({
  answer,
  estimatedScore,
  isLocked,
  isSubmitting,
  mode,
  onAnswerChange,
  onModeChange,
  onPasteBlocked,
  onSubmit,
  wordCount,
}: AnswerBoxProps) {
  function blockPasteShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isPasteShortcut =
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v")
      || (event.shiftKey && event.key === "Insert");

    if (!isPasteShortcut) {
      return;
    }

    event.preventDefault();
    onPasteBlocked();
  }

  return (
    <Card className="answer-box fade-up">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Answer studio</span>
          <h3>Type the answer yourself</h3>
        </div>

        <div className="segmented-control">
          <button
            className={mode === "text" ? "is-active" : ""}
            disabled={isLocked}
            onClick={() => onModeChange("text")}
            type="button"
          >
            Type
          </button>
          <button
            className="is-disabled"
            disabled
            title="Voice scoring is planned and will be added later."
            type="button"
          >
            Voice - soon
          </button>
        </div>
      </div>

      <div className="inline-callout inline-callout-subtle">
        Voice scoring is coming soon. The active interview flow uses typed answers so integrity checks stay consistent.
      </div>

      <textarea
        className="answer-box__textarea"
        disabled={isLocked}
        placeholder="Frame your answer with a clear opening, reasoning, and one concrete example..."
        rows={8}
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        onDrop={(event) => {
          event.preventDefault();
          onPasteBlocked();
        }}
        onKeyDown={blockPasteShortcut}
        onPaste={(event) => {
          event.preventDefault();
          onPasteBlocked();
        }}
      />

      <div className="answer-box__footer">
        <div className="quality-meter">
          <div className="quality-meter__track">
            <span style={{ width: `${estimatedScore}%` }} />
          </div>
          <small>{wordCount} words - answer readiness {estimatedScore}%</small>
        </div>

        <Button
          disabled={!answer.trim() || isSubmitting || isLocked}
          onClick={onSubmit}
          type="button"
          variant="success"
        >
          {isLocked ? "Answer submitted" : isSubmitting ? "Submitting..." : "Submit answer"}
        </Button>
      </div>
    </Card>
  );
}
