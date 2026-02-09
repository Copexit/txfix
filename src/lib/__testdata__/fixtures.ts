import type {
  MempoolTransaction,
  MempoolVin,
  MempoolVout,
  OutspendStatus,
  RecommendedFees,
  MempoolBlock,
  MempoolInfo,
} from "@/lib/api/types";

// ── Helper factories ─────────────────────────────────────────────────────────

export function makeVin(overrides: Partial<MempoolVin> = {}): MempoolVin {
  return {
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
    ...overrides,
  };
}

export function makeVout(overrides: Partial<MempoolVout> = {}): MempoolVout {
  return {
    scriptpubkey: "0014" + "cd".repeat(20),
    scriptpubkey_asm: "OP_0 OP_PUSHBYTES_20 " + "cd".repeat(20),
    scriptpubkey_type: "v0_p2wpkh",
    scriptpubkey_address: "bc1qtest" + "0".repeat(32),
    value: 50_000,
    ...overrides,
  };
}

export function makeTx(
  overrides: Partial<MempoolTransaction> = {},
): MempoolTransaction {
  return {
    txid: "b".repeat(64),
    version: 2,
    locktime: 0,
    size: 225,
    weight: 561,
    fee: 1_000,
    vin: [makeVin()],
    vout: [
      makeVout({ value: 49_000 }),
      makeVout({
        value: 50_000,
        scriptpubkey_address: "bc1qchange" + "0".repeat(30),
      }),
    ],
    status: { confirmed: false },
    ...overrides,
  };
}

export function makeLegacyVin(
  overrides: Partial<MempoolVin> = {},
): MempoolVin {
  return makeVin({
    prevout: {
      scriptpubkey: "76a914" + "ab".repeat(20) + "88ac",
      scriptpubkey_asm:
        "OP_DUP OP_HASH160 OP_PUSHBYTES_20 " +
        "ab".repeat(20) +
        " OP_EQUALVERIFY OP_CHECKSIG",
      scriptpubkey_type: "p2pkh",
      scriptpubkey_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      value: 100_000,
    },
    scriptsig: "47" + "ab".repeat(71) + "21" + "cd".repeat(33),
    scriptsig_asm: "OP_PUSHBYTES_71 ... OP_PUSHBYTES_33 ...",
    ...overrides,
  });
}

// ── Standard fixtures ────────────────────────────────────────────────────────

export const OUTSPENDS_UNSPENT: OutspendStatus[] = [
  { spent: false },
  { spent: false },
];

export const OUTSPENDS_ALL_SPENT: OutspendStatus[] = [
  { spent: true, txid: "c".repeat(64), vin: 0, status: { confirmed: false } },
  { spent: true, txid: "d".repeat(64), vin: 0, status: { confirmed: false } },
];

export const RECOMMENDED_FEES: RecommendedFees = {
  fastestFee: 50,
  halfHourFee: 30,
  hourFee: 15,
  economyFee: 5,
  minimumFee: 1,
};

export const MEMPOOL_BLOCKS: MempoolBlock[] = [
  {
    blockSize: 1_500_000,
    blockVSize: 1_000_000,
    nTx: 3000,
    totalFees: 50_000_000,
    medianFee: 30,
    feeRange: [20, 25, 30, 40, 50, 60, 100],
  },
  {
    blockSize: 1_400_000,
    blockVSize: 950_000,
    nTx: 2800,
    totalFees: 30_000_000,
    medianFee: 15,
    feeRange: [10, 12, 15, 18, 19, 20],
  },
  {
    blockSize: 1_200_000,
    blockVSize: 800_000,
    nTx: 2000,
    totalFees: 10_000_000,
    medianFee: 5,
    feeRange: [1, 2, 3, 5, 8, 10],
  },
];

export const MEMPOOL_INFO: MempoolInfo = {
  count: 50_000,
  vsize: 200_000_000,
  total_fee: 500_000_000,
  fee_histogram: [
    [100, 500_000],
    [50, 2_000_000],
    [20, 10_000_000],
    [10, 50_000_000],
    [5, 80_000_000],
    [1, 57_500_000],
  ],
};
