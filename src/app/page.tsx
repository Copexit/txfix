"use client";

import { useState, useCallback } from "react";
import { useUrlState } from "@/hooks/useUrlState";
import { useDiagnosis } from "@/hooks/useDiagnosis";
import { TxInput } from "@/components/TxInput";
import { DiagnosticSequence } from "@/components/DiagnosticSequence";
import { VerdictCard } from "@/components/VerdictCard";
import { AcceleratorFallback } from "@/components/AcceleratorFallback";
import { CostComparison } from "@/components/CostComparison";
import { FixFlow } from "@/components/FixFlow";
import { BroadcastInput } from "@/components/BroadcastInput";
import { LiveTracker } from "@/components/LiveTracker";
import { RescueReceipt } from "@/components/RescueReceipt";
import { Button } from "@/components/ui/Button";
import { TxFixError } from "@/lib/errors";
import { truncateTxid } from "@/lib/bitcoin/format";

type FixMethod = "RBF" | "CPFP";

export default function Home() {
  const { txid, setTxid } = useUrlState();
  const diagnosis = useDiagnosis(txid);
  const [fixMethod, setFixMethod] = useState<FixMethod | null>(null);
  const [broadcastedTxid, setBroadcastedTxid] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = useCallback(
    (newTxid: string) => {
      setFixMethod(null);
      setBroadcastedTxid(null);
      setConfirmed(false);
      setTxid(newTxid);
    },
    [setTxid],
  );

  const handleFix = useCallback((method: FixMethod) => {
    setFixMethod(method);
  }, []);

  const handleCancelFix = useCallback(() => {
    setFixMethod(null);
  }, []);

  const handleBroadcasted = useCallback((newTxid: string) => {
    setBroadcastedTxid(newTxid);
  }, []);

  const handleConfirmed = useCallback(() => {
    setConfirmed(true);
  }, []);

  const handleReset = useCallback(() => {
    setFixMethod(null);
    setBroadcastedTxid(null);
    setConfirmed(false);
    setTxid(null);
    diagnosis.reset();
  }, [setTxid, diagnosis]);

  const isLoading =
    diagnosis.phase === "fetching" || diagnosis.phase === "diagnosing";
  const showHero = !txid;
  const showDiagnosis = !!txid && diagnosis.steps.length > 0;
  const showVerdict =
    diagnosis.phase === "complete" &&
    diagnosis.verdict !== null &&
    !fixMethod &&
    !broadcastedTxid;
  const showFix = fixMethod !== null && !broadcastedTxid;
  const showTracker = broadcastedTxid !== null && !confirmed;
  const showReceipt = confirmed && broadcastedTxid !== null;
  const showError = diagnosis.phase === "error";

  const primaryRec = diagnosis.verdict?.recommendations.find(
    (r) => r.isPrimary,
  );
  const primaryCostUsd = primaryRec?.costUsd;

  return (
    <div
      className={`flex-1 flex flex-col ${showHero ? "items-center justify-center" : ""} px-4 py-6`}
    >
      {showHero ? (
        /* ── Hero ──────────────────────────────────────────────────────── */
        <div className="flex flex-col items-center gap-8 text-center w-full">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Transaction stuck?{" "}
              <span className="text-bitcoin">Fix it.</span>
            </h1>
            <p className="text-muted text-lg max-w-md mx-auto">
              Free diagnosis. 30-second rescue. No keys required.
            </p>
          </div>
          <TxInput onSubmit={handleSubmit} isLoading={isLoading} />
          <p className="text-muted/40 text-xs">
            Paste a Bitcoin transaction ID to diagnose it
          </p>
        </div>
      ) : (
        /* ── Diagnosis Flow ────────────────────────────────────────────── */
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {/* Compact input at top */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-muted hover:text-foreground transition-colors cursor-pointer text-sm"
              aria-label="Go back"
            >
              &larr;
            </button>
            <TxInput onSubmit={handleSubmit} isLoading={isLoading} compact />
          </div>

          {txid && (
            <p className="text-muted text-xs font-mono">
              {truncateTxid(txid, 12)}
            </p>
          )}

          {/* Diagnostic steps — hide once verdict is ready */}
          {showDiagnosis && !showVerdict && !showFix && !showTracker && !showReceipt && (
            <DiagnosticSequence
              steps={diagnosis.steps}
              isRunning={isLoading}
            />
          )}

          {/* Verdict */}
          {showVerdict && diagnosis.verdict && (
            <div className="space-y-3">
              <VerdictCard verdict={diagnosis.verdict} onFix={handleFix} />
              {primaryCostUsd !== undefined && primaryCostUsd > 0 && (
                <CostComparison
                  rescueCostUsd={primaryCostUsd}
                  method={primaryRec!.label}
                />
              )}
              {diagnosis.verdict.showAcceleratorFallback && txid && (
                <AcceleratorFallback txid={txid} />
              )}
            </div>
          )}

          {/* Fix Flow (PSBT construction + delivery) */}
          {showFix &&
            fixMethod &&
            diagnosis.txData &&
            diagnosis.rawTxHex &&
            diagnosis.verdict && (
              <div className="space-y-4">
                <FixFlow
                  method={fixMethod}
                  txData={diagnosis.txData}
                  txHex={diagnosis.rawTxHex}
                  verdict={diagnosis.verdict}
                  cpfpCandidates={diagnosis.cpfpCandidates}
                  onBroadcastReady={() => {}}
                  onCancel={handleCancelFix}
                />
                {/* Broadcast section after PSBT delivery */}
                <BroadcastInput onBroadcasted={handleBroadcasted} />
              </div>
            )}

          {/* Live Tracker */}
          {showTracker && broadcastedTxid && txid && (
            <LiveTracker
              txid={broadcastedTxid}
              originalTxid={txid}
              onConfirmed={handleConfirmed}
            />
          )}

          {/* Rescue Receipt */}
          {showReceipt &&
            broadcastedTxid &&
            txid &&
            diagnosis.verdict &&
            fixMethod && (
              <RescueReceipt
                originalTxid={txid}
                replacementTxid={broadcastedTxid}
                method={fixMethod}
                feePaidSats={
                  diagnosis.verdict.recommendations.find(
                    (r) => r.method === fixMethod,
                  )?.costSats ?? 0
                }
                btcPrice={diagnosis.btcPrice}
              />
            )}

          {/* Error */}
          {showError && diagnosis.error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 space-y-3">
              <p className="text-danger font-medium text-sm">
                {diagnosis.error instanceof TxFixError
                  ? diagnosis.error.userMessage
                  : "Something went wrong. Please try again."}
              </p>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Try again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
