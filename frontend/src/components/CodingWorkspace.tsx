"use client";

import { KeyboardEvent } from "react";
import { CompileResponse } from "../types";
import Button from "./ui/Button";
import Card from "./ui/Card";

type CodingWorkspaceProps = {
  code: string;
  explanation: string;
  expectedOutput: string;
  stdin: string;
  compileResult: CompileResponse | null;
  isCompiling: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  lineCount: number;
  onCodeChange: (value: string) => void;
  onCompile: () => void;
  onExplanationChange: (value: string) => void;
  onExpectedOutputChange: (value: string) => void;
  onPasteBlocked: () => void;
  onStdinChange: (value: string) => void;
  onSubmit: () => void;
};

export default function CodingWorkspace({
  code,
  explanation,
  expectedOutput,
  stdin,
  compileResult,
  isCompiling,
  isLocked,
  isSubmitting,
  lineCount,
  onCodeChange,
  onCompile,
  onExplanationChange,
  onExpectedOutputChange,
  onPasteBlocked,
  onStdinChange,
  onSubmit,
}: CodingWorkspaceProps) {
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
          <span className="eyebrow">Coding round</span>
          <h3>C compiler workspace</h3>
        </div>

        <div className="prompt-meta">
          <span className="tone-badge">C language</span>
          <span className="tone-badge">{lineCount} code lines</span>
        </div>
      </div>

      <textarea
        className="code-editor"
        disabled={isLocked}
        spellCheck={false}
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
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

      <div className="coding-grid">
        <div className="coding-side-panel">
          <label className="field-label" htmlFor="stdin-input">
            Program input
          </label>
          <textarea
            id="stdin-input"
            className="mini-textarea"
            disabled={isLocked}
            placeholder="Optional stdin for your program..."
            value={stdin}
            onChange={(event) => onStdinChange(event.target.value)}
          />
        </div>

        <div className="coding-side-panel">
          <label className="field-label" htmlFor="explanation-input">
            Explain your approach
          </label>
          <textarea
            id="explanation-input"
            className="mini-textarea"
            disabled={isLocked}
            placeholder="Describe the approach, time complexity, and edge cases..."
            value={explanation}
            onChange={(event) => onExplanationChange(event.target.value)}
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
        </div>

        <div className="coding-side-panel">
          <label className="field-label" htmlFor="expected-output-input">
            Expected output
          </label>
          <textarea
            id="expected-output-input"
            className="mini-textarea"
            disabled={isLocked}
            placeholder="Write the expected output or expected behavior for the solution..."
            value={expectedOutput}
            onChange={(event) => onExpectedOutputChange(event.target.value)}
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
        </div>
      </div>

      <div className="compiler-actions">
        <Button onClick={onCompile} disabled={!code.trim() || isCompiling || isLocked} type="button">
          {isCompiling ? "Compiling..." : "Compile & run"}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!code.trim() || isSubmitting || isLocked}
          type="button"
          variant="success"
        >
          {isLocked ? "Answer submitted" : isSubmitting ? "Submitting..." : "Submit coding answer"}
        </Button>
      </div>

      <div className="compiler-panel">
        <div>
          <span className="eyebrow">Compiler status</span>
          <strong className={compileResult?.compiled_successfully ? "status-good" : "status-warn"}>
            {compileResult
              ? compileResult.compiled_successfully
                ? "Compilation succeeded"
                : "Compilation failed"
              : "No compile run yet"}
          </strong>
        </div>

        <div className="compiler-output">
          <article>
            <h4>Program output</h4>
            <pre>{compileResult?.stdout || "Run the code to see stdout."}</pre>
          </article>
          <article>
            <h4>Compiler / runtime messages</h4>
            <pre>
              {compileResult?.compile_stderr
                || compileResult?.stderr
                || "Compiler diagnostics and runtime stderr will appear here."}
            </pre>
          </article>
        </div>
      </div>
    </Card>
  );
}
