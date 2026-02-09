import type { MempoolTransaction, MempoolInfo } from "@/lib/api/types";
import type { CheckResult } from "../types";
import { getEffectiveFeeRate } from "@/lib/bitcoin/fees";

export function checkMempoolPosition(
  tx: MempoolTransaction,
  mempoolInfo: MempoolInfo,
): CheckResult {
  const feeRate = getEffectiveFeeRate(tx);

  // fee_histogram is sorted by descending fee rate: [[feeRate, vsize], ...]
  let vsizeAhead = 0;
  for (const [histFeeRate, histVsize] of mempoolInfo.fee_histogram) {
    if (histFeeRate > feeRate) {
      vsizeAhead += histVsize;
    } else {
      break;
    }
  }

  const totalVsize = mempoolInfo.vsize;
  const totalCount = mempoolInfo.count;

  // Estimate position by count (proportional to vsize ratio), capped at total
  const positionEstimate =
    totalVsize > 0
      ? Math.min(Math.round((vsizeAhead / totalVsize) * totalCount), totalCount)
      : 0;

  if (vsizeAhead === 0) {
    return {
      id: "mempool-position",
      label: "Near front of mempool",
      detail: `Among the highest-fee transactions (${totalCount.toLocaleString()} total in mempool)`,
      status: "pass",
      icon: "\u2713",
    };
  }

  const vsizeAheadMvb = (vsizeAhead / 1_000_000).toFixed(1);

  return {
    id: "mempool-position",
    label: `Mempool position: ~${positionEstimate.toLocaleString()} of ${totalCount.toLocaleString()}`,
    detail: `${vsizeAheadMvb} MvB of higher-fee transactions ahead`,
    status: vsizeAhead > 4_000_000 ? "fail" : "info",
    icon: vsizeAhead > 4_000_000 ? "\u2717" : "\u25CB",
  };
}
