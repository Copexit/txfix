import type { CheckResult, Verdict, CpfpCandidate } from "@/lib/diagnosis/types";
import type {
  MempoolTransaction,
  RecommendedFees,
  MempoolInfo,
  OutspendStatus,
} from "@/lib/api/types";

export interface MockScenario {
  id: string;
  name: string;
  severity: Verdict["severity"];
  txid: string;
  steps: CheckResult[];
  verdict: Verdict;
  txData: MempoolTransaction;
  rawTxHex: string;
  cpfpCandidates: CpfpCandidate[];
  fees: RecommendedFees;
  mempoolInfo: MempoolInfo;
  outspends: OutspendStatus[];
  btcPrice: number;
}

// Deterministic fake txids
const TXID_1 = "aa".repeat(31) + "01";
const TXID_2 = "bb".repeat(31) + "02";
const TXID_3 = "cc".repeat(31) + "03";
const TXID_4 = "dd".repeat(31) + "04";
const TXID_5 = "ee".repeat(31) + "05";
const TXID_6 = "ff".repeat(31) + "06";

const FAKE_RAW_HEX = "0200000001" + "ab".repeat(100);

function makeMockTx(overrides: Partial<MempoolTransaction>): MempoolTransaction {
  return {
    txid: "0".repeat(64),
    version: 2,
    locktime: 0,
    size: 225,
    weight: 561,
    fee: 1_000,
    vin: [
      {
        txid: "a".repeat(64),
        vout: 0,
        prevout: {
          scriptpubkey: "0014" + "ab".repeat(20),
          scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 " + "ab".repeat(20),
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
          value: 100_000,
        },
        scriptsig: "",
        scriptsig_asm: "",
        is_coinbase: false,
        sequence: 0xfffffffd,
      },
    ],
    vout: [
      {
        scriptpubkey: "0014" + "cd".repeat(20),
        scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 " + "cd".repeat(20),
        scriptpubkey_type: "v0_p2wpkh",
        scriptpubkey_address: "bc1qtest" + "0".repeat(32),
        value: 49_000,
      },
      {
        scriptpubkey: "0014" + "ef".repeat(20),
        scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 " + "ef".repeat(20),
        scriptpubkey_type: "v0_p2wpkh",
        scriptpubkey_address: "bc1qchange" + "0".repeat(30),
        value: 50_000,
      },
    ],
    status: { confirmed: false },
    ...overrides,
  };
}

function makeCpfpCandidate(index: number): CpfpCandidate {
  return {
    outputIndex: index,
    address: "bc1qchange" + "0".repeat(30),
    value: 50_000,
    scriptPubKey: "0014" + "ef".repeat(20),
    scriptType: "v0_p2wpkh",
  };
}

// ── Scenario 1: Stuck (RBF + CPFP) ────────────────────────────────────────

const scenario1: MockScenario = {
  id: "1",
  name: "Stuck (RBF + CPFP)",
  severity: "STUCK",
  txid: TXID_1,
  steps: [
    { id: "confirmation-status", label: "Transaction found in mempool", detail: "Unconfirmed - awaiting inclusion in a block", status: "info", icon: "\u25CB" },
    { id: "rbf-signaling", label: "RBF signaled", detail: "sequence: 0xfffffffd", status: "pass", icon: "\u2713" },
    { id: "cpfp-feasibility", label: "CPFP possible", detail: "1 unspent output available to spend", status: "pass", icon: "\u2713" },
    { id: "fee-analysis", label: "Fee rate: 2.0 sat/vB", detail: "Well below next-block target of 50.0 sat/vB", status: "fail", icon: "\u2717" },
    { id: "mempool-position", label: "Mempool position: ~7,594 of 50,000", detail: "45.0 MvB of higher-fee transactions ahead", status: "fail", icon: "\u2717" },
    { id: "wait-estimate", label: "Estimated wait: ~8 hours", detail: "~46 blocks at current fee rate", status: "fail", icon: "\u2717" },
  ],
  verdict: {
    severity: "STUCK",
    headline: "Stuck, but fixable - ~8 hours at current rate",
    explanation: "Your transaction pays 2.0 sat/vB but the mempool needs 50.0 sat/vB for next-block confirmation.",
    recommendations: [
      { method: "RBF", label: "RBF Bump", isPrimary: true, costSats: 6_728, costUsd: 6.73, estimatedTime: "~10 min", targetFeeRate: 50 },
      { method: "CPFP", label: "CPFP Child", isPrimary: false, costSats: 12_250, costUsd: 12.25, estimatedTime: "~10 min", targetFeeRate: 111.4 },
    ],
    canRbf: true,
    canCpfp: true,
    showAcceleratorFallback: false,
    currentFeeRate: 2,
    targetFeeRate: 50,
  },
  txData: makeMockTx({ txid: TXID_1, weight: 560, fee: 280 }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [makeCpfpCandidate(1)],
  fees: { fastestFee: 50, halfHourFee: 30, hourFee: 15, economyFee: 5, minimumFee: 1 },
  mempoolInfo: { count: 50_000, vsize: 200_000_000, total_fee: 500_000_000, fee_histogram: [[100, 500_000], [50, 2_000_000], [20, 10_000_000], [10, 50_000_000], [5, 80_000_000], [1, 57_500_000]] },
  outspends: [{ spent: false }, { spent: false }],
  btcPrice: 100_000,
};

// ── Scenario 2: Stuck (CPFP only) ─────────────────────────────────────────

const scenario2: MockScenario = {
  id: "2",
  name: "Stuck (CPFP only)",
  severity: "STUCK",
  txid: TXID_2,
  steps: [
    { id: "confirmation-status", label: "Transaction found in mempool", detail: "Unconfirmed - awaiting inclusion in a block", status: "info", icon: "\u25CB" },
    { id: "rbf-signaling", label: "RBF not explicitly signaled", detail: "All inputs at max sequence - full-RBF may still work (most nodes relay since Core 28)", status: "warn", icon: "\u26A0" },
    { id: "cpfp-feasibility", label: "CPFP possible", detail: "1 unspent output available to spend", status: "pass", icon: "\u2713" },
    { id: "fee-analysis", label: "Fee rate: 1.0 sat/vB", detail: "Well below next-block target of 50.0 sat/vB", status: "fail", icon: "\u2717" },
    { id: "mempool-position", label: "Mempool position: ~45,000 of 50,000", detail: "180.0 MvB of higher-fee transactions ahead", status: "fail", icon: "\u2717" },
    { id: "wait-estimate", label: "Estimated wait: ~1 day", detail: "Could take over a day at current fee rate", status: "fail", icon: "\u2717" },
  ],
  verdict: {
    severity: "STUCK",
    headline: "Stuck, but fixable - ~1 day at current rate",
    explanation: "Your transaction pays 1.0 sat/vB but the mempool needs 50.0 sat/vB for next-block confirmation.",
    recommendations: [
      { method: "RBF", label: "RBF Bump", isPrimary: true, costSats: 6_869, costUsd: 6.87, estimatedTime: "~10 min", targetFeeRate: 50 },
      { method: "CPFP", label: "CPFP Child", isPrimary: false, costSats: 12_390, costUsd: 12.39, estimatedTime: "~10 min", targetFeeRate: 112.6 },
    ],
    canRbf: true,
    canCpfp: true,
    showAcceleratorFallback: false,
    currentFeeRate: 1,
    targetFeeRate: 50,
  },
  txData: makeMockTx({ txid: TXID_2, weight: 560, fee: 140, vin: [{ txid: "a".repeat(64), vout: 0, prevout: { scriptpubkey: "0014" + "ab".repeat(20), scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 " + "ab".repeat(20), scriptpubkey_type: "v0_p2wpkh", scriptpubkey_address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", value: 100_000 }, scriptsig: "", scriptsig_asm: "", is_coinbase: false, sequence: 0xffffffff }] }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [makeCpfpCandidate(1)],
  fees: { fastestFee: 50, halfHourFee: 30, hourFee: 15, economyFee: 5, minimumFee: 1 },
  mempoolInfo: { count: 50_000, vsize: 200_000_000, total_fee: 500_000_000, fee_histogram: [[100, 500_000], [50, 2_000_000], [20, 10_000_000], [10, 50_000_000], [5, 80_000_000], [1, 57_500_000]] },
  outspends: [{ spent: false }, { spent: false }],
  btcPrice: 100_000,
};

// ── Scenario 3: Stuck (Accelerator only) ───────────────────────────────────

const scenario3: MockScenario = {
  id: "3",
  name: "Stuck (Accelerator)",
  severity: "STUCK",
  txid: TXID_3,
  steps: [
    { id: "confirmation-status", label: "Transaction found in mempool", detail: "Unconfirmed - awaiting inclusion in a block", status: "info", icon: "\u25CB" },
    { id: "rbf-signaling", label: "RBF not explicitly signaled", detail: "All inputs at max sequence - full-RBF may still work (most nodes relay since Core 28)", status: "warn", icon: "\u26A0" },
    { id: "cpfp-feasibility", label: "No CPFP candidates", detail: "All outputs already spent or below dust limit", status: "warn", icon: "\u26A0" },
    { id: "fee-analysis", label: "Fee rate: 1.0 sat/vB", detail: "Well below next-block target of 50.0 sat/vB", status: "fail", icon: "\u2717" },
    { id: "mempool-position", label: "Mempool position: ~45,000 of 50,000", detail: "180.0 MvB of higher-fee transactions ahead", status: "fail", icon: "\u2717" },
    { id: "wait-estimate", label: "Estimated wait: ~1 day", detail: "Could take over a day at current fee rate", status: "fail", icon: "\u2717" },
  ],
  verdict: {
    severity: "STUCK",
    headline: "Stuck, but fixable - ~1 day at current rate",
    explanation: "Your transaction pays 1.0 sat/vB but the mempool needs 50.0 sat/vB for next-block confirmation.",
    recommendations: [
      { method: "RBF", label: "RBF Bump", isPrimary: true, costSats: 6_869, costUsd: 6.87, estimatedTime: "~10 min", targetFeeRate: 50 },
      { method: "ACCELERATOR", label: "Use Accelerator", isPrimary: true, costSats: 0, estimatedTime: "~10-30 min", targetFeeRate: 0 },
    ],
    canRbf: true,
    canCpfp: false,
    showAcceleratorFallback: false,
    currentFeeRate: 1,
    targetFeeRate: 50,
  },
  txData: makeMockTx({ txid: TXID_3, weight: 560, fee: 140 }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [],
  fees: { fastestFee: 50, halfHourFee: 30, hourFee: 15, economyFee: 5, minimumFee: 1 },
  mempoolInfo: { count: 50_000, vsize: 200_000_000, total_fee: 500_000_000, fee_histogram: [[100, 500_000], [50, 2_000_000], [20, 10_000_000], [10, 50_000_000], [5, 80_000_000], [1, 57_500_000]] },
  outspends: [{ spent: true, txid: "c".repeat(64), vin: 0, status: { confirmed: false } }, { spent: true, txid: "d".repeat(64), vin: 0, status: { confirmed: false } }],
  btcPrice: 100_000,
};

// ── Scenario 4: Slow ───────────────────────────────────────────────────────

const scenario4: MockScenario = {
  id: "4",
  name: "Slow",
  severity: "SLOW",
  txid: TXID_4,
  steps: [
    { id: "confirmation-status", label: "Transaction found in mempool", detail: "Unconfirmed - awaiting inclusion in a block", status: "info", icon: "\u25CB" },
    { id: "rbf-signaling", label: "RBF signaled", detail: "sequence: 0xfffffffd", status: "pass", icon: "\u2713" },
    { id: "cpfp-feasibility", label: "CPFP possible", detail: "1 unspent output available to spend", status: "pass", icon: "\u2713" },
    { id: "fee-analysis", label: "Fee rate: 8.0 sat/vB", detail: "Below next-block target (25.0 sat/vB) but within hourly range", status: "warn", icon: "\u26A0" },
    { id: "mempool-position", label: "Mempool position: ~8,500 of 30,000", detail: "2.5 MvB of higher-fee transactions ahead", status: "info", icon: "\u25CB" },
    { id: "wait-estimate", label: "Estimated wait: ~30 min", detail: "~3 blocks at current fee rate", status: "warn", icon: "\u26A0" },
  ],
  verdict: {
    severity: "SLOW",
    headline: "Slow, but fixable - ~30 min at current rate",
    explanation: "Your transaction pays 8.0 sat/vB but the mempool needs 25.0 sat/vB for next-block confirmation.",
    recommendations: [
      { method: "RBF", label: "RBF Bump", isPrimary: true, costSats: 2_380, costUsd: 2.38, estimatedTime: "~10 min", targetFeeRate: 25 },
      { method: "CPFP", label: "CPFP Child", isPrimary: false, costSats: 4_490, costUsd: 4.49, estimatedTime: "~10 min", targetFeeRate: 40.8 },
      { method: "WAIT", label: "Wait", isPrimary: false, costSats: 0, estimatedTime: "~30 min", targetFeeRate: 8 },
    ],
    canRbf: true,
    canCpfp: true,
    showAcceleratorFallback: false,
    currentFeeRate: 8,
    targetFeeRate: 25,
  },
  txData: makeMockTx({ txid: TXID_4, weight: 560, fee: 1_120 }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [makeCpfpCandidate(1)],
  fees: { fastestFee: 25, halfHourFee: 18, hourFee: 8, economyFee: 3, minimumFee: 1 },
  mempoolInfo: { count: 30_000, vsize: 80_000_000, total_fee: 200_000_000, fee_histogram: [[50, 500_000], [25, 1_000_000], [10, 1_000_000], [5, 30_000_000], [1, 47_500_000]] },
  outspends: [{ spent: false }, { spent: false }],
  btcPrice: 100_000,
};

// ── Scenario 5: Fine ───────────────────────────────────────────────────────

const scenario5: MockScenario = {
  id: "5",
  name: "Fine",
  severity: "FINE",
  txid: TXID_5,
  steps: [
    { id: "confirmation-status", label: "Transaction found in mempool", detail: "Unconfirmed - awaiting inclusion in a block", status: "info", icon: "\u25CB" },
    { id: "rbf-signaling", label: "RBF signaled", detail: "sequence: 0xfffffffd", status: "pass", icon: "\u2713" },
    { id: "cpfp-feasibility", label: "No CPFP candidates", detail: "All outputs already spent or below dust limit", status: "warn", icon: "\u26A0" },
    { id: "fee-analysis", label: "Fee rate: 50.0 sat/vB", detail: "At or above next-block target (50.0 sat/vB)", status: "pass", icon: "\u2713" },
    { id: "mempool-position", label: "Near front of mempool", detail: "Among the highest-fee transactions (15,000 total in mempool)", status: "pass", icon: "\u2713" },
    { id: "wait-estimate", label: "Estimated wait: ~10 min", detail: "Should confirm in the next block", status: "pass", icon: "\u2713" },
  ],
  verdict: {
    severity: "FINE",
    headline: "Looking good - should confirm soon",
    explanation: "Your transaction pays 50.0 sat/vB, which is sufficient for timely confirmation. No action needed.",
    recommendations: [
      { method: "WAIT", label: "Wait", isPrimary: true, costSats: 0, estimatedTime: "~10 min", targetFeeRate: 50 },
    ],
    canRbf: true,
    canCpfp: false,
    showAcceleratorFallback: false,
    currentFeeRate: 50,
    targetFeeRate: 50,
  },
  txData: makeMockTx({ txid: TXID_5, weight: 560, fee: 7_000 }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [],
  fees: { fastestFee: 50, halfHourFee: 30, hourFee: 15, economyFee: 5, minimumFee: 1 },
  mempoolInfo: { count: 15_000, vsize: 40_000_000, total_fee: 100_000_000, fee_histogram: [[100, 200_000], [50, 500_000], [20, 5_000_000], [5, 34_300_000]] },
  outspends: [{ spent: true, txid: "c".repeat(64), vin: 0, status: { confirmed: false } }, { spent: true, txid: "d".repeat(64), vin: 0, status: { confirmed: false } }],
  btcPrice: 100_000,
};

// ── Scenario 6: Confirmed ──────────────────────────────────────────────────

const scenario6: MockScenario = {
  id: "6",
  name: "Confirmed",
  severity: "CONFIRMED",
  txid: TXID_6,
  steps: [
    { id: "confirmation-status", label: "Transaction confirmed", detail: "Block #880,000", status: "pass", icon: "\u2713" },
  ],
  verdict: {
    severity: "CONFIRMED",
    headline: "Already confirmed",
    explanation: "This transaction was confirmed in block #880,000. No action needed.",
    recommendations: [],
    canRbf: false,
    canCpfp: false,
    showAcceleratorFallback: false,
    currentFeeRate: 25,
    targetFeeRate: 0,
  },
  txData: makeMockTx({
    txid: TXID_6,
    weight: 560,
    fee: 3_500,
    status: { confirmed: true, block_height: 880_000, block_hash: "00".repeat(32), block_time: 1739600000 },
  }),
  rawTxHex: FAKE_RAW_HEX,
  cpfpCandidates: [],
  fees: { fastestFee: 50, halfHourFee: 30, hourFee: 15, economyFee: 5, minimumFee: 1 },
  mempoolInfo: { count: 15_000, vsize: 40_000_000, total_fee: 100_000_000, fee_histogram: [[100, 200_000], [50, 500_000], [20, 5_000_000], [5, 34_300_000]] },
  outspends: [{ spent: false }, { spent: false }],
  btcPrice: 100_000,
};

export const DEV_SCENARIOS: MockScenario[] = [
  scenario1,
  scenario2,
  scenario3,
  scenario4,
  scenario5,
  scenario6,
];

export function getScenarioById(id: string): MockScenario | undefined {
  return DEV_SCENARIOS.find((s) => s.id === id);
}
