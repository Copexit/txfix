import type { MempoolTransaction, MempoolBlock } from "@/lib/api/types";
import type { CheckResult } from "../types";
import { getEffectiveFeeRate, estimateBlocksToConfirm } from "@/lib/bitcoin/fees";
import { formatBlockEstimate } from "@/lib/bitcoin/format";

export function checkWaitEstimate(
  tx: MempoolTransaction,
  mempoolBlocks: MempoolBlock[],
): CheckResult {
  const feeRate = getEffectiveFeeRate(tx);
  const blocks = estimateBlocksToConfirm(feeRate, mempoolBlocks);
  const timeEstimate = formatBlockEstimate(blocks);

  if (blocks <= 1) {
    return {
      id: "wait-estimate",
      label: `Estimated wait: ${timeEstimate}`,
      detail: "Should confirm in the next block",
      status: "pass",
      icon: "\u2713",
    };
  }

  if (blocks <= 6) {
    return {
      id: "wait-estimate",
      label: `Estimated wait: ${timeEstimate}`,
      detail: `~${blocks} block${blocks > 1 ? "s" : ""} at current fee rate`,
      status: "warn",
      icon: "\u26A0",
    };
  }

  return {
    id: "wait-estimate",
    label: `Estimated wait: ${timeEstimate}`,
    detail:
      blocks > 144
        ? "Could take over a day at current fee rate"
        : `~${blocks} blocks at current fee rate`,
    status: "fail",
    icon: "\u2717",
  };
}
