"use client";

import { Card } from "./ui/Card";
import { CopyButton } from "./ui/CopyButton";
import { truncateTxid, formatSats, satsToDollars } from "@/lib/bitcoin/format";
import { ACCELERATOR_COST_USD } from "@/lib/bitcoin/constants";
import { useNetwork } from "@/context/NetworkContext";
import { motion } from "motion/react";

interface RescueReceiptProps {
  originalTxid: string;
  replacementTxid: string;
  method: "RBF" | "CPFP";
  feePaidSats: number;
  btcPrice: number;
}

export function RescueReceipt({
  originalTxid,
  replacementTxid,
  method,
  feePaidSats,
  btcPrice,
}: RescueReceiptProps) {
  const { config } = useNetwork();
  const costUsd = (feePaidSats / 100_000_000) * btcPrice;
  const savings = ACCELERATOR_COST_USD - costUsd;
  const hasSavings = savings > 0;

  const summaryText = [
    `Rescued by TxFix`,
    `Method: ${method}`,
    `Fee paid: ${formatSats(feePaidSats)} (${satsToDollars(feePaidSats, btcPrice)})`,
    hasSavings
      ? `Saved ~$${savings.toFixed(2)} vs. accelerator`
      : "",
    `Original: ${originalTxid}`,
    `Replacement: ${replacementTxid}`,
    `https://txfix.it`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card accent="success" className="space-y-4">
        <div className="text-center space-y-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/15 text-success text-2xl mx-auto"
          >
            &#10003;
          </motion.div>
          <h3 className="font-bold text-lg">Transaction Rescued</h3>
          {hasSavings && (
            <p className="text-success font-semibold">
              Saved ~${savings.toFixed(2)} vs. accelerator
            </p>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Method</span>
            <span className="font-mono font-medium">{method}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Fee paid</span>
            <span className="font-mono">
              {formatSats(feePaidSats)}{" "}
              <span className="text-muted">
                ({satsToDollars(feePaidSats, btcPrice)})
              </span>
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Original TX</span>
            <a
              href={`${config.explorerUrl}/tx/${originalTxid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-bitcoin hover:underline"
            >
              {truncateTxid(originalTxid, 8)}
            </a>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Replacement TX</span>
            <a
              href={`${config.explorerUrl}/tx/${replacementTxid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-bitcoin hover:underline"
            >
              {truncateTxid(replacementTxid, 8)}
            </a>
          </div>
        </div>

        <div className="border-t border-card-border pt-3 flex justify-center">
          <CopyButton text={summaryText} label="Copy summary" />
        </div>
      </Card>
    </motion.div>
  );
}
