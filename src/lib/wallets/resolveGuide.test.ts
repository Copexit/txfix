import { describe, it, expect } from "vitest";
import { resolveGuide } from "./resolveGuide";
import type { WalletInfo } from "./types";
import type { Verdict } from "@/lib/diagnosis/types";

// ── Test fixtures ────────────────────────────────────────────────────────────

const makeVerdict = (overrides: Partial<Verdict> = {}): Verdict => ({
  severity: "STUCK",
  headline: "Test",
  explanation: "Test explanation",
  recommendations: [],
  canRbf: true,
  canCpfp: true,
  showAcceleratorFallback: false,
  currentFeeRate: 4,
  targetFeeRate: 18,
  ...overrides,
});

const sparrow: WalletInfo = {
  id: "sparrow",
  name: "Sparrow Wallet",
  description: "Test wallet",
  url: "https://sparrowwallet.com",
  platforms: ["desktop"],
  openSource: true,
  keywords: ["sparrow"],
  rbf: {
    method: "RBF",
    support: "native",
    nativeSteps: [{ instruction: "Step 1" }, { instruction: "Step 2" }],
    psbtImportMethods: ["file", "qr", "clipboard"],
    psbtSteps: [{ instruction: "PSBT step 1" }],
  },
  cpfp: {
    method: "CPFP",
    support: "native",
    nativeSteps: [{ instruction: "CPFP step 1" }],
    psbtImportMethods: ["file", "qr", "clipboard"],
  },
};

const psbtOnlyWallet: WalletInfo = {
  id: "other",
  name: "Other",
  description: "Generic",
  url: "",
  platforms: ["desktop"],
  openSource: false,
  keywords: [],
  rbf: {
    method: "RBF",
    support: "psbt-import",
    psbtSteps: [{ instruction: "Import PSBT" }],
    psbtImportMethods: ["file", "qr", "clipboard"],
  },
  cpfp: {
    method: "CPFP",
    support: "psbt-import",
    psbtSteps: [{ instruction: "Import CPFP PSBT" }],
    psbtImportMethods: ["file"],
  },
};

const noSupportWallet: WalletInfo = {
  id: "muun",
  name: "Muun",
  description: "No fee bumping",
  url: "",
  platforms: ["mobile"],
  openSource: true,
  keywords: [],
  rbf: { method: "RBF", support: "none" },
  cpfp: { method: "CPFP", support: "none" },
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("resolveGuide", () => {
  describe("native support", () => {
    it("returns native approach with steps for Sparrow RBF", () => {
      const result = resolveGuide(sparrow, "RBF", makeVerdict());
      expect(result.approach).toBe("native");
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].instruction).toBe("Step 1");
      expect(result.psbtAlternativeAvailable).toBe(true);
      expect(result.psbtImportMethods).toEqual(["file", "qr", "clipboard"]);
    });

    it("returns native approach for Sparrow CPFP", () => {
      const result = resolveGuide(sparrow, "CPFP", makeVerdict());
      expect(result.approach).toBe("native");
      expect(result.steps).toHaveLength(1);
      expect(result.psbtAlternativeAvailable).toBe(true);
    });
  });

  describe("psbt-import support", () => {
    it("returns psbt approach for generic wallet RBF", () => {
      const result = resolveGuide(psbtOnlyWallet, "RBF", makeVerdict());
      expect(result.approach).toBe("psbt");
      expect(result.steps[0].instruction).toBe("Import PSBT");
      expect(result.psbtAlternativeAvailable).toBe(true);
      expect(result.psbtImportMethods).toEqual(["file", "qr", "clipboard"]);
    });

    it("returns psbt approach with filtered methods for CPFP", () => {
      const result = resolveGuide(psbtOnlyWallet, "CPFP", makeVerdict());
      expect(result.approach).toBe("psbt");
      expect(result.psbtImportMethods).toEqual(["file"]);
    });
  });

  describe("unsupported", () => {
    it("returns unsupported when wallet has no support", () => {
      const result = resolveGuide(noSupportWallet, "RBF", makeVerdict());
      expect(result.approach).toBe("unsupported");
      expect(result.steps).toHaveLength(0);
      expect(result.psbtAlternativeAvailable).toBe(false);
    });

    it("returns unsupported when verdict says method unavailable", () => {
      const result = resolveGuide(
        sparrow,
        "RBF",
        makeVerdict({ canRbf: false }),
      );
      expect(result.approach).toBe("unsupported");
      expect(result.steps).toHaveLength(0);
    });

    it("returns unsupported when verdict says CPFP unavailable", () => {
      const result = resolveGuide(
        sparrow,
        "CPFP",
        makeVerdict({ canCpfp: false }),
      );
      expect(result.approach).toBe("unsupported");
    });
  });

  describe("edge cases", () => {
    it("preserves wallet reference in result", () => {
      const result = resolveGuide(sparrow, "RBF", makeVerdict());
      expect(result.wallet).toBe(sparrow);
      expect(result.method).toBe("RBF");
    });

    it("includes caveat when present", () => {
      const walletWithCaveat: WalletInfo = {
        ...sparrow,
        rbf: {
          ...sparrow.rbf,
          caveat: "Only works for outgoing transactions",
        },
      };
      const result = resolveGuide(walletWithCaveat, "RBF", makeVerdict());
      expect(result.caveat).toBe("Only works for outgoing transactions");
    });
  });
});
