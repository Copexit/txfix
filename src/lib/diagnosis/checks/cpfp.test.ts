import { describe, it, expect } from "vitest";
import { checkCpfpFeasibility } from "./cpfp";
import { makeTx, makeVout, OUTSPENDS_UNSPENT, OUTSPENDS_ALL_SPENT } from "@/lib/__testdata__/fixtures";

describe("checkCpfpFeasibility", () => {
  it("finds CPFP candidates above dust", () => {
    const tx = makeTx({
      vout: [makeVout({ value: 50_000 }), makeVout({ value: 30_000 })],
    });
    const result = checkCpfpFeasibility(tx, OUTSPENDS_UNSPENT);
    expect(result.candidates.length).toBe(2);
    expect(result.check.status).toBe("pass");
  });

  it("includes output exactly at dust limit (the fix)", () => {
    // v0_p2wpkh dust = 294
    const tx = makeTx({
      vout: [makeVout({ value: 294 })],
    });
    const outspends = [{ spent: false }];
    const result = checkCpfpFeasibility(tx, outspends);
    expect(result.candidates.length).toBe(1);
  });

  it("excludes output below dust", () => {
    const tx = makeTx({
      vout: [makeVout({ value: 293 })],
    });
    const outspends = [{ spent: false }];
    const result = checkCpfpFeasibility(tx, outspends);
    expect(result.candidates.length).toBe(0);
  });

  it("excludes already-spent outputs", () => {
    const tx = makeTx({
      vout: [makeVout({ value: 50_000 }), makeVout({ value: 30_000 })],
    });
    const result = checkCpfpFeasibility(tx, OUTSPENDS_ALL_SPENT);
    expect(result.candidates.length).toBe(0);
    expect(result.check.status).toBe("warn");
  });

  it("excludes outputs without address (OP_RETURN)", () => {
    const tx = makeTx({
      vout: [makeVout({ value: 50_000, scriptpubkey_address: undefined })],
    });
    const result = checkCpfpFeasibility(tx, [{ spent: false }]);
    expect(result.candidates.length).toBe(0);
  });
});
