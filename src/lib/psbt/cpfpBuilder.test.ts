import { describe, it, expect } from "vitest";
import { buildCpfpPsbt } from "./cpfpBuilder";
import { makeTx } from "@/lib/__testdata__/fixtures";
import type { CpfpCandidate } from "@/lib/diagnosis/types";
import * as bitcoin from "bitcoinjs-lib";

const network = bitcoin.networks.testnet;

function makeSegWitCandidate(overrides: Partial<CpfpCandidate> = {}): CpfpCandidate {
  return {
    outputIndex: 0,
    address: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    value: 50_000,
    scriptPubKey: "0014" + "ab".repeat(20),
    scriptType: "v0_p2wpkh",
    ...overrides,
  };
}

function makeLegacyCandidate(): CpfpCandidate {
  return {
    outputIndex: 0,
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    value: 50_000,
    scriptPubKey: "76a914" + "ab".repeat(20) + "88ac",
    scriptType: "p2pkh",
  };
}

describe("buildCpfpPsbt", () => {
  it("builds valid PSBT for SegWit candidate", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    const candidate = makeSegWitCandidate();

    const result = buildCpfpPsbt({
      parentTx: tx,
      candidate,
      targetFeeRate: 20,
      destinationAddress: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
      network,
    });

    expect(result.psbtBase64).toBeTruthy();
    expect(result.psbtHex).toBeTruthy();
    expect(result.childFee).toBeGreaterThan(0);
    expect(result.outputValue).toBe(candidate.value - result.childFee);
  });

  it("throws UNSUPPORTED_TX_TYPE for legacy (p2pkh) candidate", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    const candidate = makeLegacyCandidate();

    expect(() =>
      buildCpfpPsbt({
        parentTx: tx,
        candidate,
        targetFeeRate: 20,
        destinationAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        network,
      }),
    ).toThrow(/SegWit/);
  });

  it("throws CHANGE_OUTPUT_TOO_SMALL when output is below dust", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    const candidate = makeSegWitCandidate({ value: 300 }); // tiny

    expect(() =>
      buildCpfpPsbt({
        parentTx: tx,
        candidate,
        targetFeeRate: 50,
        destinationAddress: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
        network,
      }),
    ).toThrow(/dust/i);
  });

  it("correct output value = candidate.value - childFee", () => {
    const tx = makeTx({ weight: 400, fee: 500 });
    const candidate = makeSegWitCandidate({ value: 100_000 });

    const result = buildCpfpPsbt({
      parentTx: tx,
      candidate,
      targetFeeRate: 20,
      destinationAddress: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
      network,
    });

    expect(result.outputValue + result.childFee).toBe(candidate.value);
  });
});
