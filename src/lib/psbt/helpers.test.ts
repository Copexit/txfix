import { describe, it, expect } from "vitest";
import {
  hexToBytes,
  bytesToHex,
  extractRedeemScript,
  identifyChangeOutput,
  isSegWitInput,
  getDustLimit,
} from "./helpers";
import { makeTx, makeVin, makeVout, makeLegacyVin } from "@/lib/__testdata__/fixtures";

// ── hexToBytes ───────────────────────────────────────────────────────────────

describe("hexToBytes", () => {
  it("converts valid hex to bytes", () => {
    expect(hexToBytes("deadbeef")).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
  });

  it("handles empty string", () => {
    expect(hexToBytes("")).toEqual(new Uint8Array(0));
  });

  it("handles uppercase hex", () => {
    expect(hexToBytes("ABCD")).toEqual(new Uint8Array([0xab, 0xcd]));
  });

  it("throws on odd-length string", () => {
    expect(() => hexToBytes("abc")).toThrow("even length");
  });

  it("throws on invalid hex characters", () => {
    expect(() => hexToBytes("zzzz")).toThrow("Invalid hex");
  });

  it("known vector: deadbeef roundtrips", () => {
    const bytes = hexToBytes("deadbeef");
    expect(bytesToHex(bytes)).toBe("deadbeef");
  });
});

// ── extractRedeemScript ──────────────────────────────────────────────────────

describe("extractRedeemScript", () => {
  it("extracts P2SH-P2WPKH redeem script (22-byte push, opcode 0x16)", () => {
    // P2SH-P2WPKH redeemScript = 0x0014{20-byte-hash} = 22 bytes
    // Push opcode 0x16 = 22 decimal
    const redeemScript = "0014" + "ab".repeat(20);
    const scriptsig = "16" + redeemScript;
    const result = extractRedeemScript(scriptsig);
    expect(bytesToHex(result)).toBe(redeemScript);
  });

  it("handles OP_PUSHDATA1 (0x4c)", () => {
    // OP_PUSHDATA1, length=23, then 23 bytes
    const data = "ab".repeat(23);
    const scriptsig = "4c17" + data;
    const result = extractRedeemScript(scriptsig);
    expect(bytesToHex(result)).toBe(data);
  });

  it("handles OP_PUSHDATA2 (0x4d)", () => {
    // OP_PUSHDATA2, length=256 (little-endian: 0x00 0x01), then 256 bytes
    const data = "ab".repeat(256);
    const scriptsig = "4d0001" + data;
    const result = extractRedeemScript(scriptsig);
    expect(bytesToHex(result)).toBe(data);
  });

  it("throws on empty scriptsig", () => {
    expect(() => extractRedeemScript("")).toThrow("Empty scriptsig");
  });

  it("throws on unexpected opcode", () => {
    // 0x00 (OP_0) is not a valid push opcode in this context
    expect(() => extractRedeemScript("00")).toThrow("Unexpected opcode");
  });

  it("throws when push length exceeds buffer", () => {
    // Says 23 bytes but only provides 2
    expect(() => extractRedeemScript("17abcd")).toThrow("exceeds buffer");
  });
});

// ── identifyChangeOutput ─────────────────────────────────────────────────────

describe("identifyChangeOutput", () => {
  it("returns single candidate matching input type", () => {
    const tx = makeTx({
      vin: [makeVin()],
      vout: [
        makeVout({ scriptpubkey_type: "p2pkh", value: 40_000 }),
        makeVout({ scriptpubkey_type: "v0_p2wpkh", value: 59_777 }),
      ],
    });
    expect(identifyChangeOutput(tx)).toBe(1);
  });

  it("prefers non-round amount among multiple candidates", () => {
    const tx = makeTx({
      vin: [makeVin()],
      vout: [
        makeVout({ value: 50_000 }), // round
        makeVout({ value: 49_777 }), // non-round → change
      ],
    });
    expect(identifyChangeOutput(tx)).toBe(1);
  });

  it("falls back to last matching output when all non-round", () => {
    const tx = makeTx({
      vin: [makeVin()],
      vout: [
        makeVout({ value: 49_777 }),
        makeVout({ value: 39_333 }),
      ],
    });
    expect(identifyChangeOutput(tx)).toBe(1);
  });

  it("returns last addressable output if no type match", () => {
    const tx = makeTx({
      vin: [makeVin()],
      vout: [
        makeVout({ scriptpubkey_type: "p2pkh", scriptpubkey_address: "1abc" }),
        makeVout({
          scriptpubkey_type: "op_return",
          scriptpubkey_address: undefined,
        }),
      ],
    });
    expect(identifyChangeOutput(tx)).toBe(0);
  });

  it("returns -1 if no addressable outputs", () => {
    const tx = makeTx({
      vin: [makeVin()],
      vout: [
        makeVout({ scriptpubkey_address: undefined }),
      ],
    });
    expect(identifyChangeOutput(tx)).toBe(-1);
  });
});

// ── isSegWitInput ────────────────────────────────────────────────────────────

describe("isSegWitInput", () => {
  it("returns true for v0_p2wpkh", () => {
    expect(isSegWitInput(makeVin())).toBe(true);
  });

  it("returns false for p2pkh", () => {
    expect(isSegWitInput(makeLegacyVin())).toBe(false);
  });
});

// ── getDustLimit ─────────────────────────────────────────────────────────────

describe("getDustLimit", () => {
  it("returns 294 for v0_p2wpkh", () => {
    expect(getDustLimit("v0_p2wpkh")).toBe(294);
  });

  it("returns 546 for p2pkh", () => {
    expect(getDustLimit("p2pkh")).toBe(546);
  });

  it("returns default 546 for unknown type", () => {
    expect(getDustLimit("unknown")).toBe(546);
  });
});
