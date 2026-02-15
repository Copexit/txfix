"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBroadcast } from "@/hooks/useBroadcast";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { TxFixError } from "@/lib/errors";
import { isValidTxid } from "@/lib/bitcoin/format";

interface BroadcastInputProps {
  onBroadcasted: (txid: string) => void;
  /** "txid-only" shows just a TXID input (for wallets that broadcast internally).
   *  "full" shows both broadcast hex + TXID tabs (for PSBT flows). */
  variant?: "full" | "txid-only";
}

export function BroadcastInput({
  onBroadcasted,
  variant = "full",
}: BroadcastInputProps) {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"broadcast" | "txid">("txid");
  const { isLoading, error, broadcast } = useBroadcast();

  const handleBroadcast = async () => {
    const hex = input.trim();
    if (!hex) return;

    const txid = await broadcast(hex);
    if (txid) {
      onBroadcasted(txid);
    }
  };

  const handleTxidSubmit = () => {
    const txid = input.trim();
    if (isValidTxid(txid)) {
      onBroadcasted(txid);
    }
  };

  // TXID-only mode: minimal input, no card wrapper, no tabs
  if (variant === "txid-only") {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste replacement TXID..."
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-surface-inset border border-card-border rounded-lg px-3 py-2
            font-mono text-sm text-foreground placeholder:text-muted/50
            focus:outline-none focus:border-bitcoin transition-colors"
        />
        {input.trim() && !isValidTxid(input.trim()) && (
          <p className="text-danger text-xs">
            Invalid TXID - must be a 64-character hex string
          </p>
        )}
        <Button
          onClick={handleTxidSubmit}
          disabled={!isValidTxid(input.trim())}
          size="sm"
        >
          Track Transaction
        </Button>
      </div>
    );
  }

  // Full mode: both tabs (TXID default, broadcast as fallback)
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">Track or Broadcast</h3>
        <p className="text-muted text-sm mt-1">
          Paste your replacement transaction ID, or broadcast a signed
          transaction hex.
        </p>
      </div>

      {/* Tab toggle */}
      <div
        className="flex gap-1 bg-surface-inset rounded-lg p-1"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={tab === "txid"}
          aria-controls="panel-txid"
          id="tab-txid"
          onClick={() => {
            setTab("txid");
            setInput("");
          }}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-bitcoin focus-visible:outline-offset-1
            ${
              tab === "txid"
                ? "bg-card-bg text-foreground shadow-sm border border-card-border/50 border-b-2 border-b-bitcoin"
                : "text-muted hover:text-foreground"
            }`}
        >
          Track by TXID
        </button>
        <button
          role="tab"
          aria-selected={tab === "broadcast"}
          aria-controls="panel-broadcast"
          id="tab-broadcast"
          onClick={() => {
            setTab("broadcast");
            setInput("");
          }}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-bitcoin focus-visible:outline-offset-1
            ${
              tab === "broadcast"
                ? "bg-card-bg text-foreground shadow-sm border border-card-border/50 border-b-2 border-b-bitcoin"
                : "text-muted hover:text-foreground"
            }`}
        >
          Broadcast hex
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          id={`panel-${tab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          {tab === "txid" ? (
            <>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste replacement TXID..."
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-surface-inset border border-card-border rounded-lg px-3 py-2
                  font-mono text-sm text-foreground placeholder:text-muted/50
                  focus:outline-none focus:border-bitcoin transition-colors"
              />
              {input.trim() && !isValidTxid(input.trim()) && (
                <p className="text-danger text-xs">
                  Invalid TXID - must be a 64-character hex string
                </p>
              )}
              <Button
                onClick={handleTxidSubmit}
                disabled={!isValidTxid(input.trim())}
              >
                Track Transaction
              </Button>
            </>
          ) : (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste signed transaction hex..."
                spellCheck={false}
                autoComplete="off"
                rows={3}
                className="w-full bg-surface-inset border border-card-border rounded-lg px-3 py-2
                  font-mono text-sm text-foreground placeholder:text-muted/50
                  focus:outline-none focus:border-bitcoin transition-colors resize-none"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleBroadcast}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Broadcasting...
                    </span>
                  ) : (
                    "Broadcast"
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="text-danger text-sm">
          {error instanceof TxFixError
            ? error.userMessage
            : "Broadcast failed. Check the transaction hex and try again."}
        </p>
      )}
    </Card>
  );
}
