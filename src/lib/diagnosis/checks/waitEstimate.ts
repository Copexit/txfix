import type { MempoolTransaction, MempoolBlock, MempoolInfo } from "@/lib/api/types";
import type { CheckResult } from "../types";
import { getEffectiveFeeRate, estimateBlocksToConfirm, estimateBlocksFromPosition } from "@/lib/bitcoin/fees";
import { formatBlockEstimate } from "@/lib/bitcoin/format";

export function checkWaitEstimate(
  tx: MempoolTransaction,
  mempoolBlocks: MempoolBlock[],
  mempoolInfo: MempoolInfo,
): CheckResult {
  const feeRate = getEffectiveFeeRate(tx);
  const blocksByFee = estimateBlocksToConfirm(feeRate, mempoolBlocks);
  const blocksByPosition = estimateBlocksFromPosition(feeRate, mempoolInfo);
  const blocks = Math.max(blocksByFee, blocksByPosition);
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
