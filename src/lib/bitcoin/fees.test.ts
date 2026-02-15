import { describe, it, expect } from "vitest";
import {
  getEffectiveFeeRate,
  calculateRbfCost,
  calculateCpfpCost,
  estimateBlocksToConfirm,
  estimateBlocksFromPosition,
} from "./fees";
import { makeTx, MEMPOOL_BLOCKS, MEMPOOL_INFO } from "@/lib/__testdata__/fixtures";

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

// ── estimateBlocksFromPosition ───────────────────────────────────────────────

describe("estimateBlocksFromPosition", () => {
  it("returns 1 when fee is above all histogram entries", () => {
    // MEMPOOL_INFO histogram: [100, 50, 20, 10, 5, 1] - fee 200 is above all
    expect(estimateBlocksFromPosition(200, MEMPOOL_INFO)).toBe(1);
  });

  it("returns correct block count for mid-range fee", () => {
    // Fee rate 10: entries above 10 are [100, 500k], [50, 2M], [20, 10M]
    // vsizeAhead = 500k + 2M + 10M = 12.5M
    // blocks = ceil(12.5M / 1M) + 1 = 13 + 1 = 14
    expect(estimateBlocksFromPosition(10, MEMPOOL_INFO)).toBe(14);
  });

  it("returns high count for very low fee with large queue", () => {
    // Fee rate 0.1: all entries are above -> total = 500k + 2M + 10M + 50M + 80M + 57.5M = 200M
    // blocks = ceil(200M / 1M) + 1 = 200 + 1 = 201
    expect(estimateBlocksFromPosition(0.1, MEMPOOL_INFO)).toBe(201);
  });

  it("handles empty histogram", () => {
    const emptyInfo = { count: 0, vsize: 0, total_fee: 0, fee_histogram: [] as [number, number][] };
    expect(estimateBlocksFromPosition(10, emptyInfo)).toBe(1);
  });

  it("returns correct estimate for fee between histogram entries", () => {
    // Fee rate 30: entries above 30 are [100, 500k], [50, 2M]
    // vsizeAhead = 500k + 2M = 2.5M
    // blocks = ceil(2.5M / 1M) + 1 = 3 + 1 = 4
    expect(estimateBlocksFromPosition(30, MEMPOOL_INFO)).toBe(4);
  });
});
