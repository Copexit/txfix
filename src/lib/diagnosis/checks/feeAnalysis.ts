import type { MempoolTransaction, RecommendedFees, MempoolBlock } from "@/lib/api/types";
import type { CheckResult } from "../types";
import { getEffectiveFeeRate } from "@/lib/bitcoin/fees";
import { formatFeeRate } from "@/lib/bitcoin/format";

export function checkFeeAdequacy(
  tx: MempoolTransaction,
  fees: RecommendedFees,
  _mempoolBlocks: MempoolBlock[],
): CheckResult {
  const feeRate = getEffectiveFeeRate(tx);
  const nextBlockTarget = fees.fastestFee;

  if (feeRate >= nextBlockTarget) {
    return {
      id: "fee-analysis",
      label: `Fee rate: ${formatFeeRate(feeRate)}`,
      detail: `At or above next-block target (${formatFeeRate(nextBlockTarget)})`,
      status: "pass",
      icon: "\u2713",
    };
  }

  if (feeRate >= fees.hourFee) {
    return {
      id: "fee-analysis",
      label: `Fee rate: ${formatFeeRate(feeRate)}`,
      detail: `Below next-block target (${formatFeeRate(nextBlockTarget)}) but within hourly range`,
      status: "warn",
      icon: "\u26A0",
    };
  }

  return {
    id: "fee-analysis",
    label: `Fee rate: ${formatFeeRate(feeRate)}`,
    detail: `Well below next-block target of ${formatFeeRate(nextBlockTarget)}`,
    status: "fail",
    icon: "\u2717",
  };
}
