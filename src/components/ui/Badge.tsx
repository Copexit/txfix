import { type HTMLAttributes } from "react";

type BadgeVariant = "danger" | "warning" | "success" | "info" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted/15 text-muted border-muted/30",
};

export function Badge({
  variant = "muted",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md border
        ${variantClasses[variant]}
        ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
