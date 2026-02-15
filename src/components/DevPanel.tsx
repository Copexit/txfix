"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { MockScenario } from "@/lib/__devdata__/scenarios";

const severityColors: Record<string, string> = {
  STUCK: "bg-danger/20 text-danger border-danger/30",
  SLOW: "bg-warning/20 text-warning border-warning/30",
  FINE: "bg-success/20 text-success border-success/30",
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

interface DevPanelProps {
  visible: boolean;
  scenarios: MockScenario[];
  activeScenarioId: string | null;
  onActivate: (id: string) => void;
  onClose: () => void;
}

export function DevPanel({
  visible,
  scenarios,
  activeScenarioId,
  onActivate,
  onClose,
}: DevPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 w-72 bg-surface-inset/95 backdrop-blur-md border border-card-border rounded-xl shadow-2xl"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-card-border">
            <span className="text-xs font-mono text-muted">Dev Scenarios</span>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors cursor-pointer p-0.5"
              aria-label="Close dev panel"
            >
              <X size={14} />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {scenarios.map((scenario) => {
              const isActive = scenario.id === activeScenarioId;
              return (
                <button
                  key={scenario.id}
                  onClick={() => onActivate(scenario.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-bitcoin/15 text-bitcoin ring-1 ring-bitcoin/30"
                      : "text-foreground/80 hover:bg-foreground/5"
                  }`}
                >
                  <kbd className="w-5 h-5 flex items-center justify-center rounded bg-foreground/10 text-[10px] font-mono text-muted shrink-0">
                    {scenario.id}
                  </kbd>
                  <span className="flex-1 truncate text-xs">{scenario.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${severityColors[scenario.severity] ?? "bg-foreground/10 text-muted"}`}
                  >
                    {scenario.severity}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-3 py-1.5 border-t border-card-border">
            <p className="text-[10px] text-muted/60 font-mono">
              Press ` to toggle, 1-6 to activate, Esc to close
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
