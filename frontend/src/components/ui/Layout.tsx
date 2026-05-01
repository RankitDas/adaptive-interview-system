import Link from "next/link";
import { PropsWithChildren } from "react";
import BugReportBar from "../BugReportBar";

type LayoutProps = PropsWithChildren<{
  compact?: boolean;
}>;

export default function Layout({ children, compact = false }: LayoutProps) {
  return (
    <div className="app-shell">
      <div className="utility-bar">
        <span>
          <span className="status-dot" /> Integrity guard active: paste blocking and tab tracking are enabled.
        </span>
        <a href="mailto:dasrankit2018@gmail.com">Report a bug</a>
      </div>

      <header className="site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__pill">AI</span>
          <span>
            Adaptive Interview
            <small>Interview practice, coding rounds, ATS scoring.</small>
          </span>
        </Link>

        <nav className="site-nav">
          <Link href="/interview">Interview</Link>
          <Link href="/results">Results</Link>
          <Link href="/ats">ATS Checker</Link>
        </nav>
      </header>

      <main className={compact ? "page page-compact" : "page"}>{children}</main>

      <div className="page page-full bug-report-wrap">
        <BugReportBar />
      </div>

      <footer className="site-footer">
        <span>Adaptive Interview System</span>
        <a href="mailto:dasrankit2018@gmail.com">Need help or found a bug? Email dasrankit2018@gmail.com</a>
      </footer>
    </div>
  );
}
