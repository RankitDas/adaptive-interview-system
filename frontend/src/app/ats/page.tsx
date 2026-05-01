"use client";

import { useState } from "react";
import Layout from "../../components/ui/Layout";
import Card from "../../components/ui/Card";
import { evaluateResume } from "../../services/api";
import { AtsResponse } from "../../types";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AtsPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<AtsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLargeInputAdjustment =
    Boolean(result?.resume_truncated) || Boolean(result?.job_description_truncated);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("required_skills", requiredSkills);
      formData.append("resume_text", resumeText);

      if (resumeFile) {
        formData.append("resume_file", resumeFile);
      }

      const response = await evaluateResume(formData);
      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze the resume right now.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Layout>
      <section className="interview-header fade-up">
        <div>
          <span className="eyebrow">ATS checker</span>
          <h1>Resume matching workspace.</h1>
          <p>
            Paste resume text or upload a file, add the target role, and get a clear match breakdown without exposing internal processing details.
          </p>
        </div>
      </section>

      <div className="ats-grid">
        <Card className="fade-up">
          <span className="eyebrow">Resume input</span>
          <div className="panel-topline">
            <h3>Upload or paste</h3>
            <span className="status-badge status-badge-live">Live</span>
          </div>

          <label className="field-label" htmlFor="resume-file">
            Resume file (PDF, DOCX, or TXT)
          </label>
          <input
            id="resume-file"
            className="file-input"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            type="file"
          />

          <label className="field-label" htmlFor="resume-text">
            Resume text
          </label>
          <textarea
            id="resume-text"
            className="answer-box__textarea compact-textarea"
            placeholder="Paste the resume text here if you do not want to upload a file."
            rows={10}
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
          />
        </Card>

        <Card className="fade-up">
          <span className="eyebrow">Job target</span>
          <div className="panel-topline">
            <h3>Role description</h3>
            <span className="status-badge status-badge-live">Live</span>
          </div>

          <label className="field-label" htmlFor="job-description">
            Job description
          </label>
          <textarea
            id="job-description"
            className="answer-box__textarea compact-textarea"
            placeholder="Paste the JD here..."
            rows={10}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />

          <label className="field-label" htmlFor="required-skills">
            Required skills
          </label>
          <input
            id="required-skills"
            className="text-input"
            placeholder="C, Data Structures, FastAPI, SQL, Problem Solving"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
          />
          <p className="muted-copy">
            Leave this blank if you want the checker to infer target skills from the job description.
          </p>

          <button
            className="button button-primary"
            disabled={isAnalyzing || (!resumeText && !resumeFile) || !jobDescription.trim()}
            onClick={handleAnalyze}
            type="button"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze ATS match"}
          </button>

          {error ? <p className="error-banner">{error}</p> : null}
        </Card>

        <Card className="fade-up">
          <span className="eyebrow">ATS result</span>
          <div className="panel-topline">
            <h3>Match breakdown</h3>
            <span className="status-badge status-badge-live">Live</span>
          </div>

          {result ? (
            <>
              <div className="stat-grid">
                <article>
                  <strong>{formatPercent(result.overall_match)}</strong>
                  <span>dynamic ATS score</span>
                </article>
                <article>
                  <strong>{formatPercent(result.skill_alignment_score)}</strong>
                  <span>skill evidence score</span>
                </article>
                <article>
                  <strong>{formatPercent(result.hard_skills_match)}</strong>
                  <span>skill coverage</span>
                </article>
                <article>
                  <strong>{formatPercent(result.content_similarity)}</strong>
                  <span>content similarity</span>
                </article>
              </div>

              <div className="stat-grid stat-grid-two">
                <article>
                  <strong>{formatPercent(result.semantic_similarity)}</strong>
                  <span>
                    {result.semantic_engine === "sentence-transformers"
                      ? "semantic meaning score"
                      : "keyword overlap score"}
                  </span>
                </article>
                <article>
                  <strong>
                    {result.matched_skill_count}/{result.total_skill_count}
                  </strong>
                  <span>
                    {result.skill_source === "required_skills"
                      ? "required skills matched"
                      : result.skill_source === "role_bank"
                        ? "role-bank skills matched"
                      : result.skill_source === "job_description"
                        ? "JD skills matched"
                        : "skills available"}
                  </span>
                </article>
              </div>

              <p className="info-banner">
                {result.skill_source === "required_skills"
                  ? "Scored from the required skills list, with higher weight on the skills emphasized in the job description."
                  : result.skill_source === "role_bank"
                    ? "Required skills were empty, so the ATS checker used the closest role skill bank plus the job description."
                  : result.skill_source === "job_description"
                    ? "Required skills were empty, so the ATS checker inferred target skills from the job description first."
                    : "No strong skill list was available, so this score leaned more on content alignment."}
              </p>

              {hasLargeInputAdjustment ? (
                <p className="info-banner">
                  Large input was safely shortened behind the scenes so scoring stays stable.
                </p>
              ) : null}

              <div className="insight-list">
                <div>
                  <strong>Target skills</strong>
                  <ul className="chip-list">
                    {result.target_skills.length > 0 ? (
                      result.target_skills.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>Add required skills or a richer job description.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Found skills</strong>
                  <ul className="chip-list">
                    {result.found_skills.length > 0 ? (
                      result.found_skills.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No target skills matched yet.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Missing skills</strong>
                  <ul className="chip-list">
                    {result.missing_skills.length > 0 ? (
                      result.missing_skills.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No target skills are missing.</li>
                    )}
                  </ul>
                </div>
              </div>

              <p className="coach-tip">{result.suggestion}</p>
            </>
          ) : (
            <p className="muted-copy">
              Add the resume and job details, then run the ATS analysis to see the score breakdown here.
            </p>
          )}

          <div className="coming-soon-card coming-soon-card-compact" aria-disabled="true">
            <strong>PDF export and batch resume comparison</strong>
            <span>Coming soon</span>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
