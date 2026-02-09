"use client";

import { useState } from "react";
import { BbqrAnimatedQr } from "./BbqrAnimatedQr";
import { PsbtFileDownload } from "./PsbtFileDownload";
import { PsbtHexDisplay } from "./PsbtHexDisplay";
import { Card } from "./ui/Card";
import { formatSats, formatFeeRate } from "@/lib/bitcoin/format";

interface PsbtDeliveryProps {
  psbtBase64: string;
  psbtHex: string;
  fee: number;
  method: "RBF" | "CPFP";
  targetFeeRate?: number;
}

type Tab = "qr" | "file" | "hex";

const TABS: { value: Tab; label: string }[] = [
  { value: "qr", label: "Scan QR" },
  { value: "file", label: "Download" },
  { value: "hex", label: "Raw Hex" },
];

export function PsbtDelivery({
  psbtBase64,
  psbtHex,
  fee,
  method,
  targetFeeRate,
}: PsbtDeliveryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("qr");

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">
          {method === "RBF" ? "RBF Replacement" : "CPFP Child"} Transaction
        </h3>
        <p className="text-muted text-sm mt-1">
          Fee: {formatSats(fee)}
          {targetFeeRate ? ` (${formatFeeRate(targetFeeRate)})` : ""}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#111113] rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer
              ${
                activeTab === tab.value
                  ? "bg-card-bg text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex justify-center">
        {activeTab === "qr" && <BbqrAnimatedQr psbtBase64={psbtBase64} />}
        {activeTab === "file" && (
          <div className="w-full">
            <PsbtFileDownload psbtBase64={psbtBase64} />
          </div>
        )}
        {activeTab === "hex" && (
          <div className="w-full">
            <PsbtHexDisplay psbtHex={psbtHex} />
          </div>
        )}
      </div>

      <p className="text-xs text-muted text-center border-t border-card-border pt-3">
        Sign this PSBT in your wallet, then come back to broadcast.
        <br />
        <strong className="text-foreground">TxFix never touches your keys.</strong>
      </p>
    </Card>
  );
}
