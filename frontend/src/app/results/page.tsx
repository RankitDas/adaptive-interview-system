"use client";

import Layout from "../../components/ui/Layout";
import Card from "../../components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoredSessionReport } from "../../types";

const SESSION_STORAGE_KEY = "adaptive-interview:last-session";

export default function ResultsPage() {
  const [report, setReport] = useState<StoredSessionReport | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      setReport(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  return (
    <Layout compact>
      <section className="results-shell">
        <Card className="fade-up">
          <span className="eyebrow">Last session</span>
          <h1>Interviewer review</h1>

          {report ? (
            <>
              <div className="stat-grid">
                <article>
                  <strong>{report.session.average_score.toFixed(1)}</strong>
                  <span>session average</span>
                </article>
                <article>
                  <strong>{report.session.answered_count}</strong>
                  <span>questions answered</span>
                </article>
                <article>
                  <strong>{report.session.warnings}</strong>
                  <span>integrity warnings</span>
                </article>
              </div>

              {report.message ? <p className="inline-callout">{report.message}</p> : null}

              <p className="coach-tip">{report.review.summary}</p>

              <div className="insight-list">
                <div>
                  <strong>Strengths</strong>
                  <ul>
                    {report.review.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Problems noticed</strong>
                  <ul>
                    {report.review.problems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="insight-list">
                <div>
                  <strong>Improvements needed</strong>
                  <ul>
                    {report.review.improvements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Interviewer note</strong>
                  <p className="muted-copy">{report.review.interviewer_note}</p>
                  <p className="muted-copy">
                    Next step: {report.review.recommended_next_step}
                  </p>
                  {report.review.malpractice_note ? (
                    <p className="error-inline">{report.review.malpractice_note}</p>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <p className="muted-copy">
              No saved session yet. Complete an interview session to populate the interviewer review here.
            </p>
          )}

          <div className="hero__actions">
            <Link href="/interview" className="button button-primary">
              Return to interview
            </Link>
            <Link href="/ats" className="button button-secondary">
              Open ATS checker
            </Link>
          </div>
        </Card>
      </section>
    </Layout>
  );
}
