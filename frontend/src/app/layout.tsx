import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Adaptive Interview System",
  description:
    "A polished adaptive interview simulator with live coaching, voice practice, and session feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
