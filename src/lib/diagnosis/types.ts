import type {
  MempoolTransaction,
  RecommendedFees,
  MempoolInfo,
  OutspendStatus,
} from "@/lib/api/types";

// ── Check Results ────────────────────────────────────────────────────────────

export type CheckStatus = "running" | "pass" | "warn" | "fail" | "info";

export interface CheckResult {
  id: string;
  label: string;
  detail: string;
  status: CheckStatus;
  icon: "\u2713" | "\u26A0" | "\u2717" | "\u25CB" | "\u27F3";
}

// ── Verdict ──────────────────────────────────────────────────────────────────

export type VerdictSeverity = "STUCK" | "SLOW" | "FINE" | "CONFIRMED";

export interface Verdict {
  severity: VerdictSeverity;
  headline: string;
  explanation: string;
  recommendations: Recommendation[];
  canRbf: boolean;
  canCpfp: boolean;
  showAcceleratorFallback: boolean;
  currentFeeRate: number;
  targetFeeRate: number;
}

export interface Recommendation {
  method: "RBF" | "CPFP" | "WAIT" | "ACCELERATOR";
  label: string;
  isPrimary: boolean;
  costSats: number;
  costUsd?: number;
  estimatedTime: string;
  targetFeeRate: number;
}

// ── CPFP Candidates ──────────────────────────────────────────────────────────

export interface CpfpCandidate {
  outputIndex: number;
  address: string;
  value: number;
  scriptPubKey: string;
  scriptType: string;
}

// ── Diagnosis State ──────────────────────────────────────────────────────────

export type DiagnosisPhase =
  | "idle"
  | "fetching"
  | "diagnosing"
  | "complete"
  | "error";

export interface DiagnosisState {
  phase: DiagnosisPhase;
  steps: CheckResult[];
  verdict: Verdict | null;
  txData: MempoolTransaction | null;
  rawTxHex: string | null;
  fees: RecommendedFees | null;
  mempoolInfo: MempoolInfo | null;
  outspends: OutspendStatus[] | null;
  cpfpCandidates: CpfpCandidate[];
  btcPrice: number;
  error: Error | null;
}

// ── Engine Data Bundle (fetched data passed to checks) ───────────────────────

export interface DiagnosisData {
  tx: MempoolTransaction;
  txHex: string;
  fees: RecommendedFees;
  mempoolBlocks: import("@/lib/api/types").MempoolBlock[];
  mempoolInfo: MempoolInfo;
  outspends: OutspendStatus[];
  btcPrice: number;
}
