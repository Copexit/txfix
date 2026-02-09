import { describe, it, expect } from "vitest";
import { checkRbfSignaling, hasExplicitRbf } from "./rbf";
import { makeTx, makeVin } from "@/lib/__testdata__/fixtures";

describe("checkRbfSignaling", () => {
  it("detects RBF-signaled input", () => {
    const tx = makeTx({
      vin: [makeVin({ sequence: 0xfffffffd })],
    });
    const result = checkRbfSignaling(tx);
    expect(result.status).toBe("pass");
    expect(result.label).toContain("signaled");
  });

  it("warns for max-sequence inputs", () => {
    const tx = makeTx({
      vin: [makeVin({ sequence: 0xffffffff })],
    });
    const result = checkRbfSignaling(tx);
    expect(result.status).toBe("warn");
  });

  it("handles empty vin array gracefully", () => {
    const tx = makeTx({ vin: [] });
    const result = checkRbfSignaling(tx);
    expect(result.status).toBe("warn");
    expect(result.label).toContain("No inputs");
  });

  it("shows warn for 0xfffffffe (not RBF)", () => {
    const tx = makeTx({
      vin: [makeVin({ sequence: 0xfffffffe })],
    });
    const result = checkRbfSignaling(tx);
    expect(result.status).toBe("warn");
  });
});

describe("hasExplicitRbf", () => {
  it("returns true when sequence < 0xfffffffe", () => {
    const tx = makeTx({ vin: [makeVin({ sequence: 0xfffffffd })] });
    expect(hasExplicitRbf(tx)).toBe(true);
  });

  it("returns false for max sequence", () => {
    const tx = makeTx({ vin: [makeVin({ sequence: 0xffffffff })] });
    expect(hasExplicitRbf(tx)).toBe(false);
  });
});
