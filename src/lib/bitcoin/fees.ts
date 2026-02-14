import type { MempoolTransaction, MempoolBlock } from "@/lib/api/types";
import type { CpfpCandidate } from "@/lib/diagnosis/types";
import { TxFixError, ErrorCode } from "@/lib/errors";
import { ESTIMATED_CHILD_VSIZES, DEFAULT_CHILD_VSIZE } from "./constants";

/**
 * Calculate the effective fee rate of a transaction in sat/vB.
 */
export function getEffectiveFeeRate(tx: MempoolTransaction): number {
  if (tx.weight <= 0) {
    throw new TxFixError(
      ErrorCode.PSBT_CONSTRUCTION_FAILED,
      "Transaction weight must be positive.",
    );
  }
  const vsize = tx.weight / 4;
  return tx.fee / vsize;
}

/**
 * Calculate the additional cost of an RBF bump to a target fee rate.
 */
export function calculateRbfCost(
  tx: MempoolTransaction,
  targetFeeRate: number,
): { additionalFeeSats: number; newTotalFee: number } {
  const vsize = tx.weight / 4;
  const newTotalFee = Math.ceil(vsize * targetFeeRate);
  const additionalFeeSats = Math.max(newTotalFee - tx.fee, 1);
  return { additionalFeeSats, newTotalFee };
}

/**
 * Calculate the required child transaction fee for CPFP.
 * The child must pay enough to bring the parent+child package to the target fee rate.
 */
export function calculateCpfpCost(
  parentTx: MempoolTransaction,
  candidate: CpfpCandidate,
  targetFeeRate: number,
): {
  childFeeSats: number;
  effectiveChildFeeRate: number;
  childVsize: number;
} {
  const parentVsize = parentTx.weight / 4;
  const childVsize =
    ESTIMATED_CHILD_VSIZES[candidate.scriptType] ?? DEFAULT_CHILD_VSIZE;
  const packageVsize = parentVsize + childVsize;
  const requiredPackageFee = Math.ceil(packageVsize * targetFeeRate);
  const childFeeSats = Math.max(
    requiredPackageFee - parentTx.fee,
    childVsize, // at least 1 sat/vB
  );
  const effectiveChildFeeRate = childFeeSats / childVsize;
  return { childFeeSats, effectiveChildFeeRate, childVsize };
}

/**
 * Estimate how many blocks until a transaction at a given fee rate confirms.
 */
export function estimateBlocksToConfirm(
  feeRate: number,
  mempoolBlocks: MempoolBlock[],
): number {
  if (mempoolBlocks.length === 0) return 1;

  for (let i = 0; i < mempoolBlocks.length; i++) {
    const block = mempoolBlocks[i];
    const minFee = block.feeRange[0] ?? 0;
    if (feeRate >= minFee) return i + 1;
  }

  // Beyond projected blocks -very stuck
  return mempoolBlocks.length + 6;
}
