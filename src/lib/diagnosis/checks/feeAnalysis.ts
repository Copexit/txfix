import type { MempoolTransaction, RecommendedFees, MempoolBlock } from "@/lib/api/types";
import type { CheckResult } from "../types";
import { getEffectiveFeeRate } from "@/lib/bitcoin/fees";
import { formatFeeRate } from "@/lib/bitcoin/format";

export function checkFeeAdequacy(
  tx: MempoolTransaction,
  fees: RecommendedFees,
  mempoolBlocks: MempoolBlock[],
): CheckResult {
  const feeRate = getEffectiveFeeRate(tx);
  const nextBlockMin =
    mempoolBlocks.length > 0 ? mempoolBlocks[0].feeRange[0] ?? fees.fastestFee : fees.fastestFee;

  if (feeRate >= nextBlockMin) {
    return {
      id: "fee-analysis",
      label: `Fee rate: ${formatFeeRate(feeRate)}`,
      detail: `At or above next-block minimum (${formatFeeRate(nextBlockMin)})`,
      status: "pass",
      icon: "\u2713",
    };
  }

  if (feeRate >= fees.hourFee) {
    return {
      id: "fee-analysis",
      label: `Fee rate: ${formatFeeRate(feeRate)}`,
      detail: `Below next-block target (${formatFeeRate(nextBlockMin)}) but within hourly range`,
      status: "warn",
      icon: "\u26A0",
    };
  }

  return {
    id: "fee-analysis",
    label: `Fee rate: ${formatFeeRate(feeRate)}`,
    detail: `Well below next-block minimum of ${formatFeeRate(nextBlockMin)}`,
    status: "fail",
    icon: "\u2717",
  };
}
