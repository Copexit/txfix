"use client";

import { useNetwork } from "@/context/NetworkContext";
import { Card } from "./ui/Card";

interface AcceleratorFallbackProps {
  txid: string;
}

export function AcceleratorFallback({ txid }: AcceleratorFallbackProps) {
  const { config, network } = useNetwork();

  return (
    <Card accent="warning" className="space-y-3">
      <h3 className="font-semibold">Accelerator Recommended</h3>
      <p className="text-muted text-sm leading-relaxed">
        Neither RBF nor CPFP are available for this transaction. You can try a
        mining pool accelerator to speed up confirmation.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={`${config.explorerUrl}/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
            bg-card-bg border border-card-border rounded-lg hover:border-muted transition-colors"
        >
          View on mempool.space (opens in new tab)
        </a>
        {network === "mainnet" && (
          <a
            href="https://www.viabtc.com/tools/txaccelerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
              bg-card-bg border border-card-border rounded-lg hover:border-muted transition-colors"
          >
            ViaBTC Free Accelerator (opens in new tab)
          </a>
        )}
      </div>
    </Card>
  );
}
