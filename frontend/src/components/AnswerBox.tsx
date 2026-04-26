"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { InterviewMode } from "../types";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventShape) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEventShape = {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
};

type AnswerBoxProps = {
  answer: string;
  estimatedScore: number;
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
  isSubmitting,
  mode,
  onAnswerChange,
  onModeChange,
  onPasteBlocked,
  onSubmit,
  wordCount,
}: AnswerBoxProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      onAnswerChange(transcript.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onAnswerChange]);

  function toggleListening() {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  }

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
            onClick={() => onModeChange("text")}
            type="button"
          >
            Type
          </button>
          <button
            className={mode === "voice" ? "is-active" : ""}
            onClick={() => onModeChange("voice")}
            type="button"
          >
            Voice
          </button>
        </div>
      </div>

      {mode === "voice" && voiceSupported ? (
        <div className="voice-panel">
          <p>
            Browser speech capture is active here so you can rehearse delivery, but the final answer still stays inside this interview workspace.
          </p>
          <Button
            onClick={toggleListening}
            variant={isListening ? "danger" : "secondary"}
            type="button"
          >
            {isListening ? "Stop listening" : "Start voice capture"}
          </Button>
        </div>
      ) : null}

      {mode === "voice" && !voiceSupported ? (
        <div className="voice-panel">
          <p>
            Voice capture is not available in this browser. You can still type your answer and rehearse aloud.
          </p>
        </div>
      ) : null}

      <textarea
        className="answer-box__textarea"
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
          <small>{wordCount} words · answer readiness {estimatedScore}%</small>
        </div>

        <Button
          disabled={!answer.trim() || isSubmitting}
          onClick={onSubmit}
          type="button"
          variant="success"
        >
          {isSubmitting ? "Submitting..." : "Submit answer"}
        </Button>
      </div>
    </Card>
  );
}
