"use client";

import { motion } from "motion/react";
import type { CheckResult } from "@/lib/diagnosis/types";

interface DiagnosticStepProps {
  step: CheckResult;
}

const statusColors: Record<string, string> = {
  pass: "text-success",
  warn: "text-warning",
  fail: "text-danger",
  info: "text-muted",
  running: "text-bitcoin",
};

export function DiagnosticStep({ step }: DiagnosticStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-2.5 py-1"
    >
      <span className={`${statusColors[step.status] ?? "text-muted"} text-sm leading-5 shrink-0 w-4 text-center`}>
        {step.icon}
      </span>
      <span className="text-sm leading-5">
        <span className="text-foreground">{step.label}</span>
        {step.detail && (
          <span className="text-muted"> &mdash; {step.detail}</span>
        )}
      </span>
    </motion.div>
  );
}
