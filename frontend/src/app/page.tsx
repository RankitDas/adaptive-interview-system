import Link from "next/link";
import Layout from "../components/ui/Layout";
import Card from "../components/ui/Card";

const features = [
  "Adaptive theory and coding rounds with separate timing rules.",
  "Anti-malpractice flow with tab-switch warnings and automatic termination after repeated violations.",
  "Built-in C compiler workspace for coding questions with compile and run output.",
  "Interviewer-style session review showing problems, improvements, and next-step guidance.",
  "ATS resume checker for live job-fit scoring inside the same project.",
  "Bug-report contact bar so issues can be sent directly from the product context.",
];

export default function HomePage() {
  return (
    <Layout>
      <section className="hero">
        <div className="hero__copy fade-up">
          <span className="eyebrow">Full interview simulator</span>
          <h1>Train like the real round, not a demo screen.</h1>
          <p>
            Practice technical interviews with adaptive theory prompts, live coding rounds, ATS resume scoring, and interviewer-style review inside one tighter workspace.
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

        <Card className="hero-card fade-up">
          <div className="hero-card__pulse" />
          <span className="eyebrow">What you get</span>
          <div className="hero-card__metrics">
            <article>
              <strong>01</strong>
              <span>Adaptive theory and coding rounds</span>
            </article>
            <article>
              <strong>02</strong>
              <span>Integrity rules and timing control</span>
            </article>
            <article>
              <strong>03</strong>
              <span>ATS plus interviewer review</span>
            </article>
          </div>
        </Card>
      </section>

      <section className="feature-strip">
        {features.map((feature) => (
          <Card key={feature} className="feature-strip__card fade-up">
            <p>{feature}</p>
          </Card>
        ))}
      </section>
    </Layout>
  );
}
