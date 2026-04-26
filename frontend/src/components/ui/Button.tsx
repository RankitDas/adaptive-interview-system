import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    block?: boolean;
  }
>;

export default function Button({
  children,
  className = "",
  variant = "primary",
  block = false,
  ...props
}: ButtonProps) {
  const classes = [
    "button",
    `button-${variant}`,
    block ? "button-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
