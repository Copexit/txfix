import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "danger" | "warning" | "success" | "info" | "bitcoin";
}

const accentClasses: Record<string, string> = {
  danger: "border-t-2 border-t-danger",
  warning: "border-t-2 border-t-warning",
  success: "border-t-2 border-t-success",
  info: "border-t-2 border-t-info",
  bitcoin: "border-t-2 border-t-bitcoin",
};

export function Card({
  accent,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-card-bg border border-card-border rounded-xl p-5
        ${accent ? accentClasses[accent] : ""}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
