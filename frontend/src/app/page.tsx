import Link from "next/link";
import Layout from "../components/ui/Layout";
import Card from "../components/ui/Card";

const liveCapabilities = [
  {
    title: "Adaptive interview rounds",
    detail: "Theory and C coding questions adjust by performance and timing signal.",
  },
  {
    title: "Integrity controls",
    detail: "Paste blocking, tab-switch warnings, and automatic termination are active.",
  },
  {
    title: "ATS resume checker",
    detail: "Upload or paste a resume and compare it against a target job description.",
  },
  {
    title: "Session review",
    detail: "Saved feedback shows strengths, problems, improvements, and next steps.",
  },
];

const comingSoon = [
  "Voice scoring with delivery feedback",
  "Multi-language compiler workspace",
  "Saved candidate history and exports",
];

export default function HomePage() {
  return (
    <Layout>
      <section className="hero app-dashboard">
        <div className="hero__copy fade-up">
          <span className="eyebrow">Shipping-ready practice workspace</span>
          <h1>Run a focused interview session from one clean command center.</h1>
          <p>
            Start adaptive theory or C coding rounds, keep integrity checks visible, review interviewer-style feedback, and score resumes without leaving the product.
          </p>

          <div className="hero__actions">
            <Link href="/interview" className="button button-primary">
              Start interview
            </Link>
            <Link href="/ats" className="button button-secondary">
              Open ATS checker
            </Link>
            <Link href="/results" className="button button-secondary">
              View last results
            </Link>
          </div>
        </div>

        <Card className="hero-card product-panel fade-up">
          <div className="panel-topline">
            <span className="eyebrow">Product status</span>
            <span className="status-badge status-badge-live">Live</span>
          </div>
          <div className="readiness-score">
            <strong>5</strong>
            <span>question session target</span>
          </div>
          <div className="mini-dashboard" aria-label="Interview workflow preview">
            <article className="mini-dashboard__tile mini-dashboard__tile-dark">
              <span>Round mix</span>
              <strong>Theory + Coding</strong>
            </article>
            <article className="mini-dashboard__tile">
              <span>Integrity</span>
              <strong>Active</strong>
            </article>
            <article className="mini-dashboard__tile mini-dashboard__wide">
              <div className="panel-topline">
                <span>Readiness trend</span>
                <strong>68%</strong>
              </div>
              <div className="mini-dashboard__meter" aria-hidden="true">
                <span />
              </div>
            </article>
          </div>
          <p className="muted-copy">
            The core workflow is available now. Planned modules stay labeled until they are ready.
          </p>
        </Card>
      </section>

      <section className="feature-strip">
        {liveCapabilities.map((feature) => (
          <Card key={feature.title} className="feature-strip__card fade-up">
            <div className="panel-topline">
              <strong>{feature.title}</strong>
              <span className="status-badge status-badge-live">Live</span>
            </div>
            <p>{feature.detail}</p>
          </Card>
        ))}
      </section>

      <section className="roadmap-band fade-up">
        <div>
          <span className="eyebrow">Coming soon</span>
          <h2>Planned features are labeled before users reach them.</h2>
        </div>
        <div className="coming-soon-grid">
          {comingSoon.map((item) => (
            <div className="coming-soon-card" key={item} aria-disabled="true">
              <strong>{item}</strong>
              <span>Coming soon</span>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
