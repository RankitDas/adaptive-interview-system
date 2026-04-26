"use client";

import Link from "next/link";
import AnswerBox from "../../components/AnswerBox";
import CodingWorkspace from "../../components/CodingWorkspace";
import FeedbackPanel from "../../components/FeedbackPanel";
import QuestionCard from "../../components/QuestionCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Layout from "../../components/ui/Layout";
import { useInterview } from "../../hooks/useInterview";
import { InterviewPersonality, InterviewRound } from "../../types";

const personalities: InterviewPersonality[] = ["friendly", "normal", "strict"];
const rounds: InterviewRound[] = ["theory", "coding"];

export default function InterviewPage() {
  const {
    answer,
    answerMetrics,
    code,
    compilerResult,
    currentTimeLimit,
    elapsed,
    error,
    expectedOutput,
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
    setExpectedOutput,
    setMode,
    setPersonality,
    setRoundType,
    setStdin,
    beginInterview,
    compileCurrentCode,
    reportPasteBlocked,
    resetInterview,
    submitCurrentAnswer,
  } = useInterview();

  const canLaunchQuestion =
    !isLoadingQuestion && !isSessionActive && !session.terminated && session.status !== "completed";

  return (
    <Layout>
      <section className="interview-header fade-up">
        <div>
          <span className="eyebrow">Interview command center</span>
          <h1>Integrity-aware interview practice with theory and coding rounds.</h1>
          <p>
            Choose the round type, keep the interview tab active, type answers yourself, and review the final interviewer summary when the session closes.
          </p>
        </div>

        <div className="interview-header__actions">
          <Button
            onClick={() => beginInterview(personality, roundType)}
            disabled={!canLaunchQuestion}
            type="button"
          >
            {session.status === "completed"
              ? "Session complete"
              : questionResponse
                ? "Load next question"
                : "Start session"}
          </Button>
          <Button onClick={resetInterview} variant="ghost" type="button">
            Reset session
          </Button>
          <Link href="/ats" className="button button-secondary">
            ATS checker
          </Link>
        </div>
      </section>

      <div className="dashboard-grid dashboard-grid-wide">
        <Card className="dashboard-card fade-up">
          <span className="eyebrow">Round type</span>
          <h3>Select the interview round</h3>
          <div className="choice-row">
            {rounds.map((item) => (
              <button
                key={item}
                className={roundType === item ? "choice-pill is-active" : "choice-pill"}
                onClick={() => setRoundType(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="muted-copy">
            Theory questions use a 3 minute timer. Coding questions use a 15 minute timer with a live C compiler.
          </p>
        </Card>

        <Card className="dashboard-card fade-up">
          <span className="eyebrow">Interviewer tone</span>
          <h3>Pick the pressure level</h3>
          <div className="choice-row">
            {personalities.map((item) => (
              <button
                key={item}
                className={personality === item ? "choice-pill is-active" : "choice-pill"}
                onClick={() => setPersonality(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="muted-copy">
            Friendly softens difficulty, strict increases pressure, and normal stays balanced.
          </p>
        </Card>

        <Card className="dashboard-card fade-up">
          <span className="eyebrow">Integrity status</span>
          <h3>Malpractice guard</h3>
          <div className="stat-grid stat-grid-single">
            <article>
              <strong>{session.warnings}/{session.warning_limit}</strong>
              <span>tab-switch warnings</span>
            </article>
          </div>
          <p className="muted-copy">
            After 5 warnings the interview is terminated and the site will show “Stop malpractice during interview.”
          </p>
        </Card>

        <Card className="dashboard-card fade-up">
          <span className="eyebrow">Readiness</span>
          <h3>Live answer quality</h3>
          <div className="readiness-ring">
            <strong>{answerMetrics.estimatedScore}%</strong>
            <span>{answerMetrics.pressureLevel} pressure</span>
          </div>
          <p className="muted-copy">
            {roundType === "coding"
              ? "The meter rises as the code body and explanation become more complete."
              : "The meter rises as your typed answer gains depth and structure."}
          </p>
        </Card>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}
      {sessionMessage ? <p className="info-banner">{sessionMessage}</p> : null}

      {questionResponse ? (
        <div className="workspace-grid workspace-grid-tight">
          <div className="workspace-grid__main">
            <QuestionCard
              difficulty={questionResponse.difficulty}
              elapsed={elapsed}
              personality={questionResponse.personality}
              question={questionResponse.question}
              remainingTime={answerMetrics.remainingTime}
              roundType={questionResponse.round_type}
              timeLimit={currentTimeLimit}
            />

            {roundType === "coding" ? (
              <CodingWorkspace
                code={code}
                compileResult={compilerResult}
                explanation={answer}
                expectedOutput={expectedOutput}
                isCompiling={isCompiling}
                isSubmitting={isSubmitting}
                lineCount={answerMetrics.lineCount}
                onCodeChange={setCode}
                onCompile={compileCurrentCode}
                onExplanationChange={setAnswer}
                onExpectedOutputChange={setExpectedOutput}
                onPasteBlocked={reportPasteBlocked}
                onStdinChange={setStdin}
                onSubmit={submitCurrentAnswer}
                stdin={stdin}
              />
            ) : (
              <AnswerBox
                answer={answer}
                estimatedScore={answerMetrics.estimatedScore}
                isSubmitting={isSubmitting}
                mode={mode}
                onAnswerChange={setAnswer}
                onModeChange={setMode}
                onPasteBlocked={reportPasteBlocked}
                onSubmit={submitCurrentAnswer}
                wordCount={answerMetrics.wordCount}
              />
            )}
          </div>

          <div className="workspace-grid__side">
            <FeedbackPanel
              message={sessionMessage}
              result={result}
              review={review}
              session={session}
            />
          </div>
        </div>
      ) : (
        <Card className="launch-card fade-up">
          <span className="eyebrow">Session flow</span>
          <h2>
            {session.terminated
              ? "Session terminated."
              : session.status === "completed"
                ? "Session completed."
                : "Launch the next interview question."}
          </h2>
          <p>
            {session.terminated
              ? "Stop malpractice during interview. Reset the session to start again."
              : session.status === "completed"
                ? "Open the results page to inspect the interviewer review, problems found, and suggested improvements."
                : "Choose theory or coding, then start the round. Answers must be typed manually and tab switching is monitored."}
          </p>

          <div className="hero__actions">
            {session.status !== "completed" && !session.terminated ? (
              <Button onClick={() => beginInterview(personality, roundType)} disabled={!canLaunchQuestion}>
                {isLoadingQuestion ? "Loading..." : "Launch interview"}
              </Button>
            ) : null}
            <Link href="/results" className="button button-secondary">
              Open result summary
            </Link>
          </div>
        </Card>
      )}
    </Layout>
  );
}
