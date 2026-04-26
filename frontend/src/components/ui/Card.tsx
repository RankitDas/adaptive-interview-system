import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export default function Card({ children, className = "" }: CardProps) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}
