import Card from "./ui/Card";
import { InterviewReview, SessionSnapshot, SubmitAnswerResponse } from "../types";

type FeedbackPanelProps = {
  message: string | null;
  result: SubmitAnswerResponse | null;
  review: InterviewReview;
  session: SessionSnapshot;
};

export default function FeedbackPanel({
  message,
  result,
  review,
  session,
}: FeedbackPanelProps) {
  const hasSessionData = session.answered_count > 0 || Boolean(result);

  return (
    <div className="feedback-grid">
      <Card className="fade-up">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Session health</span>
            <h3>Interview control panel</h3>
          </div>
          <div className="score-chip">
            <strong>{session.average_score.toFixed(1)}</strong>
            <span>avg score</span>
          </div>
        </div>

        <div className="stat-grid">
          <article>
            <strong>{session.answered_count}</strong>
            <span>answers completed</span>
          </article>
          <article>
            <strong>{session.warnings}/{session.warning_limit}</strong>
            <span>integrity warnings</span>
          </article>
          <article>
            <strong>{session.round_breakdown.coding || 0}</strong>
            <span>coding rounds done</span>
          </article>
        </div>

        {message ? <p className="inline-callout">{message}</p> : null}

        <div className="insight-list">
          <div>
            <strong>Strengths</strong>
            <ul>
              {session.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Focus areas</strong>
            <ul>
              {session.focus_areas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="fade-up">
        <span className="eyebrow">Interviewer review</span>
        <h3>What the interviewer would say</h3>

        {hasSessionData ? (
          <>
            <p className="coach-tip">{review.summary}</p>

            <div className="insight-list">
              <div>
                <strong>Main problems</strong>
                <ul>
                  {review.problems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Improvements needed</strong>
                <ul>
                  {review.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {review.malpractice_note ? (
              <p className="error-inline">{review.malpractice_note}</p>
            ) : null}
          </>
        ) : (
          <div className="empty-state-card">
            <strong>Review unlocks after the first answer.</strong>
            <p className="muted-copy">
              Start the interview and submit one original answer to get interviewer-style problems, improvements, and round feedback here.
            </p>
          </div>
        )}
      </Card>

      <Card className="fade-up">
        <span className="eyebrow">Latest feedback</span>
        <h3>Round feedback</h3>

        {result ? (
          <>
            <div className="result-badge">
              <strong>{result.evaluation.score}/3</strong>
              <span>latest answer score</span>
            </div>

            <ul className="rich-list">
              {result.evaluation.feedback.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="coach-tip">{result.coaching_tip}</p>

            <div className="session-insights">
              {result.session_insights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="muted-copy">
            Submit an answer to unlock interviewer-style round feedback and session review notes.
          </p>
        )}
      </Card>
    </div>
  );
}
