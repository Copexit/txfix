import { describe, it, expect } from "vitest";
import {
  getEffectiveFeeRate,
  calculateRbfCost,
  calculateCpfpCost,
  estimateBlocksToConfirm,
} from "./fees";
import { makeTx, MEMPOOL_BLOCKS } from "@/lib/__testdata__/fixtures";

// ── getEffectiveFeeRate ──────────────────────────────────────────────────────

describe("getEffectiveFeeRate", () => {
  it("calculates fee rate correctly", () => {
    const tx = makeTx({ weight: 400, fee: 1000 });
    // vsize = 400/4 = 100, rate = 1000/100 = 10
    expect(getEffectiveFeeRate(tx)).toBe(10);
  });

  it("handles fee = 0", () => {
    const tx = makeTx({ weight: 400, fee: 0 });
    expect(getEffectiveFeeRate(tx)).toBe(0);
  });

  it("throws on weight = 0", () => {
    const tx = makeTx({ weight: 0, fee: 100 });
    expect(() => getEffectiveFeeRate(tx)).toThrow();
  });

  it("throws on negative weight", () => {
    const tx = makeTx({ weight: -100, fee: 100 });
    expect(() => getEffectiveFeeRate(tx)).toThrow();
  });
});

// ── calculateRbfCost ─────────────────────────────────────────────────────────

describe("calculateRbfCost", () => {
  it("calculates additional fee correctly", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    // vsize=100, targetRate=20 → newFee=2000, additional=1500
    const result = calculateRbfCost(tx, 20);
    expect(result.newTotalFee).toBe(2000);
    expect(result.additionalFeeSats).toBe(1500);
  });

  it("returns minimum 1 sat when feeDelta is 0", () => {
    const tx = makeTx({ weight: 400, fee: 2000 });
    // vsize=100, targetRate=20 → newFee=2000, delta=0 → min 1
    const result = calculateRbfCost(tx, 20);
    expect(result.additionalFeeSats).toBe(1);
  });

  it("returns minimum 1 sat when target below current", () => {
    const tx = makeTx({ weight: 400, fee: 3000 });
    const result = calculateRbfCost(tx, 10);
    expect(result.additionalFeeSats).toBe(1);
  });
});

// ── calculateCpfpCost ────────────────────────────────────────────────────────

describe("calculateCpfpCost", () => {
  it("calculates child fee for normal case", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    const candidate = {
      outputIndex: 0,
      address: "bc1qtest",
      value: 50_000,
      scriptPubKey: "0014" + "ab".repeat(20),
      scriptType: "v0_p2wpkh",
    };
    // parentVsize=100, childVsize=110, package=210
    // requiredFee = ceil(210*20) = 4200, childFee = max(4200-500, 110) = 3700
    const result = calculateCpfpCost(tx, candidate, 20);
    expect(result.childFeeSats).toBe(3700);
    expect(result.childVsize).toBe(110);
  });

  it("floors child fee to childVsize (1 sat/vB)", () => {
    // When parent already pays enough
    const tx = makeTx({ weight: 400, fee: 10_000 });
    const candidate = {
      outputIndex: 0,
      address: "bc1qtest",
      value: 50_000,
      scriptPubKey: "0014" + "ab".repeat(20),
      scriptType: "v0_p2wpkh",
    };
    // requiredFee = ceil(210*20) = 4200, childFee = max(4200-10000, 110) = max(-5800, 110) = 110
    const result = calculateCpfpCost(tx, candidate, 20);
    expect(result.childFeeSats).toBe(110);
  });
});

// ── estimateBlocksToConfirm ──────────────────────────────────────────────────

describe("estimateBlocksToConfirm", () => {
  it("returns 1 for empty blocks array", () => {
    expect(estimateBlocksToConfirm(10, [])).toBe(1);
  });

  it("returns 1 for fee above first block min", () => {
    expect(estimateBlocksToConfirm(100, MEMPOOL_BLOCKS)).toBe(1);
  });

  it("returns correct block for mid-range fee", () => {
    // Block 0: minFee=20, Block 1: minFee=10, Block 2: minFee=1
    expect(estimateBlocksToConfirm(25, MEMPOOL_BLOCKS)).toBe(1); // >= 20
    expect(estimateBlocksToConfirm(15, MEMPOOL_BLOCKS)).toBe(2); // >= 10
    expect(estimateBlocksToConfirm(5, MEMPOOL_BLOCKS)).toBe(3);  // >= 1
  });

  it("returns length+6 for very low fee", () => {
    expect(estimateBlocksToConfirm(0.1, MEMPOOL_BLOCKS)).toBe(
      MEMPOOL_BLOCKS.length + 6,
    );
  });
});
