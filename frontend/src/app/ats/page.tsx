"use client";

import { useState } from "react";
import Layout from "../../components/ui/Layout";
import Card from "../../components/ui/Card";
import { evaluateResume } from "../../services/api";
import { AtsResponse } from "../../types";

export default function AtsPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<AtsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

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
      setComingSoonMessage(null);
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
          <h1>Live resume matching workspace.</h1>
          <p>
            Paste resume text or upload a resume file, add the job description and required skills, and score the match directly inside the site.
          </p>
        </div>
      </section>

      <div className="ats-grid">
        <Card className="fade-up">
          <span className="eyebrow">Resume input</span>
          <h3>Upload or paste</h3>

          <label className="field-label" htmlFor="resume-file">
            Resume file (PDF, DOCX, or TXT)
          </label>
          <input
            id="resume-file"
            className="file-input"
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
          <h3>Role description</h3>

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
          <h3>Match breakdown</h3>

          {result ? (
            <>
              <div className="stat-grid">
                <article>
                  <strong>{result.overall_match}%</strong>
                  <span>overall match</span>
                </article>
                <article>
                  <strong>{result.hard_skills_match}%</strong>
                  <span>hard skills match</span>
                </article>
                <article>
                  <strong>{result.content_similarity}%</strong>
                  <span>content similarity</span>
                </article>
              </div>

              <div className="stat-grid stat-grid-two">
                <article>
                  <strong>
                    {result.semantic_engine === "sentence-transformers"
                      ? `${result.semantic_similarity}%`
                      : "Soon"}
                  </strong>
                  <span>
                    {result.semantic_engine === "sentence-transformers"
                      ? "semantic similarity"
                      : "semantic AI score"}
                  </span>
                </article>
                {result.semantic_engine === "sentence-transformers" ? (
                  <article>
                    <strong>Live</strong>
                    <span>AI matching active</span>
                  </article>
                ) : (
                  <button
                    className="coming-soon-card"
                    onClick={() => setComingSoonMessage("Semantic AI ATS scoring is coming soon. The current result uses skills and content similarity first.")}
                    type="button"
                  >
                    <strong>Coming soon</strong>
                    <span>semantic AI matching</span>
                  </button>
                )}
              </div>

              {comingSoonMessage ? (
                <p className="info-banner">{comingSoonMessage}</p>
              ) : null}

              <div className="insight-list">
                <div>
                  <strong>Found skills</strong>
                  <ul className="chip-list">
                    {result.found_skills.length > 0 ? (
                      result.found_skills.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No required skills matched yet.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong>Missing skills</strong>
                  <ul className="chip-list">
                    {result.missing_skills.length > 0 ? (
                      result.missing_skills.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No required skills are missing.</li>
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
        </Card>
      </div>
    </Layout>
  );
}
