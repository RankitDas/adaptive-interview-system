"use client";

import { useMemo, useState } from "react";

const REPORT_EMAIL = "dasrankit2018@gmail.com";

export default function BugReportBar() {
  const [subject, setSubject] = useState("Bug report");
  const [details, setDetails] = useState("");

  const mailtoHref = useMemo(() => {
    const finalSubject = subject.trim() || "Bug report";
    const finalBody = details.trim()
      || "Describe the bug here, including the page, steps, and what went wrong.";

    return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;
  }, [details, subject]);

  return (
    <section className="bug-report-shell">
      <div className="bug-report-copy">
        <span className="eyebrow">Bug report</span>
        <h3>Found a problem in the site?</h3>
        <p className="muted-copy">
          Write the issue below and open an email directly to {REPORT_EMAIL}.
        </p>
      </div>

      <div className="bug-report-form">
        <input
          className="text-input"
          placeholder="Bug title"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
        <textarea
          className="mini-textarea"
          placeholder="Describe the bug, what page it happened on, and how to reproduce it..."
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
        <a className="button button-primary" href={mailtoHref}>
          Send bug report email
        </a>
      </div>
    </section>
  );
}
