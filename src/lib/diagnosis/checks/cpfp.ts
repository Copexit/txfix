import type { MempoolTransaction, OutspendStatus } from "@/lib/api/types";
import type { CheckResult, CpfpCandidate } from "../types";
import { DUST_LIMITS, DEFAULT_DUST_LIMIT } from "@/lib/bitcoin/constants";

export function checkCpfpFeasibility(
  tx: MempoolTransaction,
  outspends: OutspendStatus[],
): { check: CheckResult; candidates: CpfpCandidate[] } {
  const candidates: CpfpCandidate[] = [];

  for (let i = 0; i < tx.vout.length; i++) {
    const output = tx.vout[i];
    const outspend = outspends[i];

    // Skip already-spent outputs and OP_RETURN
    if (outspend?.spent) continue;
    if (!output.scriptpubkey_address) continue;

    const dustLimit =
      DUST_LIMITS[output.scriptpubkey_type] ?? DEFAULT_DUST_LIMIT;
    if (output.value < dustLimit) continue;

    candidates.push({
      outputIndex: i,
      address: output.scriptpubkey_address,
      value: output.value,
      scriptPubKey: output.scriptpubkey,
      scriptType: output.scriptpubkey_type,
    });
  }

  if (candidates.length > 0) {
    return {
      check: {
        id: "cpfp-feasibility",
        label: "CPFP possible",
        detail: `${candidates.length} unspent output${candidates.length > 1 ? "s" : ""} available to spend`,
        status: "pass",
        icon: "\u2713",
      },
      candidates,
    };
  }

  return {
    check: {
      id: "cpfp-feasibility",
      label: "No CPFP candidates",
      detail: "All outputs already spent or below dust limit",
      status: "warn",
      icon: "\u26A0",
    },
    candidates: [],
  };
}
