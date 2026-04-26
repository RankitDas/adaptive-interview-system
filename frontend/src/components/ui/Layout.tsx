import Link from "next/link";
import { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  compact?: boolean;
}>;

export default function Layout({ children, compact = false }: LayoutProps) {
  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow-left" />
      <div className="app-shell__glow app-shell__glow-right" />

      <div className="utility-bar">
        <span>Interview integrity is active: answer pasting is blocked and tab switches are tracked.</span>
        <a href="mailto:dasrankit2018@gmail.com">Report bugs: dasrankit2018@gmail.com</a>
      </div>

      <header className="site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__pill">AI</span>
          <span>
            Adaptive Interview
            <small>Practice with adaptive pressure, feedback, and flow.</small>
          </span>
        </Link>

        <nav className="site-nav">
          <Link href="/interview">Interview</Link>
          <Link href="/results">Results</Link>
          <Link href="/ats">ATS Checker</Link>
        </nav>
      </header>

      <main className={compact ? "page page-compact" : "page"}>{children}</main>

      <footer className="site-footer">
        <span>Adaptive Interview System</span>
        <a href="mailto:dasrankit2018@gmail.com">Need help or found a bug? Email dasrankit2018@gmail.com</a>
      </footer>
    </div>
  );
}
