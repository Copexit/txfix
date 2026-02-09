import { describe, it, expect } from "vitest";
import {
  formatSats,
  satsToUsd,
  satsToDollars,
  isValidTxid,
  formatFeeRate,
  formatBtc,
  truncateTxid,
  formatBlockEstimate,
} from "./format";

// ── satsToUsd ────────────────────────────────────────────────────────────────

describe("satsToUsd", () => {
  it("converts sats to USD correctly", () => {
    // 1 BTC = 100_000 USD, 50_000 sats = 0.0005 BTC = $50
    expect(satsToUsd(50_000, 100_000)).toBeCloseTo(50);
  });

  it("returns 0 for sats = 0", () => {
    expect(satsToUsd(0, 100_000)).toBe(0);
  });

  it("returns 0 for btcPrice = 0", () => {
    expect(satsToUsd(50_000, 0)).toBe(0);
  });

  it("returns 0 for negative btcPrice", () => {
    expect(satsToUsd(50_000, -100)).toBe(0);
  });
});

// ── satsToDollars ────────────────────────────────────────────────────────────

describe("satsToDollars", () => {
  it("formats dollar amount", () => {
    // 50_000 sats at $100k/BTC = $50.00
    expect(satsToDollars(50_000, 100_000)).toBe("$50.00");
  });

  it("handles zero price gracefully", () => {
    expect(satsToDollars(50_000, 0)).toBe("$0.00");
  });
});

// ── formatSats ───────────────────────────────────────────────────────────────

describe("formatSats", () => {
  it("formats with digits and 'sats' suffix", () => {
    const result = formatSats(12345);
    expect(result).toContain("12");
    expect(result).toContain("345");
    expect(result).toContain("sats");
  });
});

// ── isValidTxid ──────────────────────────────────────────────────────────────

describe("isValidTxid", () => {
  it("accepts 64-char hex string", () => {
    expect(isValidTxid("a".repeat(64))).toBe(true);
  });

  it("rejects 63-char string", () => {
    expect(isValidTxid("a".repeat(63))).toBe(false);
  });

  it("rejects 65-char string", () => {
    expect(isValidTxid("a".repeat(65))).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidTxid("g".repeat(64))).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidTxid("")).toBe(false);
  });
});

// ── Other format functions ───────────────────────────────────────────────────

describe("formatFeeRate", () => {
  it("formats with one decimal", () => {
    expect(formatFeeRate(18.5)).toBe("18.5 sat/vB");
  });
});

describe("formatBtc", () => {
  it("formats sats as BTC", () => {
    expect(formatBtc(100_000_000)).toBe("1.00000000 BTC");
  });
});

describe("truncateTxid", () => {
  it("truncates long txid", () => {
    const txid = "a".repeat(64);
    const result = truncateTxid(txid, 8);
    expect(result.length).toBeLessThan(64);
    expect(result).toContain("\u2026");
  });

  it("returns short string unchanged", () => {
    expect(truncateTxid("abcd", 8)).toBe("abcd");
  });
});

describe("formatBlockEstimate", () => {
  it("formats minutes", () => {
    expect(formatBlockEstimate(1)).toBe("~10 min");
  });

  it("formats hours", () => {
    expect(formatBlockEstimate(6)).toBe("~1 hour");
  });

  it("formats days", () => {
    expect(formatBlockEstimate(144)).toBe("~1 day");
  });
});
