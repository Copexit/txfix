import type { WalletInfo, ResolvedGuide } from "./types";
import type { Verdict } from "@/lib/diagnosis/types";

/**
 * Given a wallet, a fix method, and the diagnosis verdict,
 * resolve exactly what guide to show the user.
 */
export function resolveGuide(
  wallet: WalletInfo,
  method: "RBF" | "CPFP",
  verdict: Verdict,
): ResolvedGuide {
  const guide = method === "RBF" ? wallet.rbf : wallet.cpfp;
  const methodAvailable = method === "RBF" ? verdict.canRbf : verdict.canCpfp;

  // Method not available per diagnosis, or wallet doesn't support it at all
  if (!methodAvailable || guide.support === "none") {
    return {
      wallet,
      method,
      approach: "unsupported",
      steps: [],
      psbtAlternativeAvailable: false,
      psbtImportMethods: [],
      caveat: guide.caveat,
      autoFee: guide.autoFee ?? false,
    };
  }

  // Wallet has native UI for this method
  if (guide.support === "native") {
    return {
      wallet,
      method,
      approach: "native",
      steps: guide.nativeSteps ?? [],
      psbtAlternativeAvailable: (guide.psbtImportMethods?.length ?? 0) > 0,
      psbtImportMethods: guide.psbtImportMethods ?? [],
      caveat: guide.caveat,
      autoFee: guide.autoFee ?? false,
    };
  }

  // Wallet supports PSBT import
  return {
    wallet,
    method,
    approach: "psbt",
    steps: guide.psbtSteps ?? [],
    psbtAlternativeAvailable: true,
    psbtImportMethods: guide.psbtImportMethods ?? [],
    caveat: guide.caveat,
    autoFee: guide.autoFee ?? false,
  };
}
