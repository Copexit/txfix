import { type HTMLAttributes } from "react";

interface MonoTextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "p" | "code";
}

export function MonoText({
  as: Tag = "span",
  className = "",
  children,
  ...props
}: MonoTextProps) {
  return (
    <Tag
      className={`font-mono text-sm ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
