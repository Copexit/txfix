"use client";

import { ACCELERATOR_COST_USD } from "@/lib/bitcoin/constants";

interface CostComparisonProps {
  rescueCostUsd: number;
  method: string;
}

export function CostComparison({ rescueCostUsd, method }: CostComparisonProps) {
  const savings = ACCELERATOR_COST_USD - rescueCostUsd;
  if (savings <= 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted bg-success/5 border border-success/20 rounded-lg px-3 py-2">
      <span className="text-success font-medium">
        Save ~${savings.toFixed(2)}
      </span>
      <span>
        vs accelerator &middot; {method}: ~${rescueCostUsd.toFixed(2)} vs ~${ACCELERATOR_COST_USD}
      </span>
    </div>
  );
}
