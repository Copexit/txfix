"use client";

import { useState, useCallback } from "react";
import type { MempoolTransaction } from "@/lib/api/types";
import type { CpfpCandidate } from "@/lib/diagnosis/types";
import type { BitcoinNetwork } from "@/lib/bitcoin/networks";

export interface PsbtResult {
  psbtBase64: string;
  psbtHex: string;
  fee: number;
  method: "RBF" | "CPFP";
}

interface UsePsbtBuilderReturn {
  psbt: PsbtResult | null;
  isBuilding: boolean;
  error: Error | null;
  buildRbf: (params: {
    originalTx: MempoolTransaction;
    originalTxHex: string;
    targetFeeRate: number;
    network: BitcoinNetwork;
  }) => Promise<void>;
  buildCpfp: (params: {
    parentTx: MempoolTransaction;
    candidate: CpfpCandidate;
    targetFeeRate: number;
    destinationAddress: string;
    network: BitcoinNetwork;
  }) => Promise<void>;
  reset: () => void;
}

function getBitcoinJsNetwork(network: BitcoinNetwork) {
  // Dynamic import to avoid loading bitcoinjs-lib until needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bitcoin = require("bitcoinjs-lib");
  switch (network) {
    case "mainnet":
      return bitcoin.networks.bitcoin;
    case "testnet4":
    case "signet":
      return bitcoin.networks.testnet;
  }
}

export function usePsbtBuilder(): UsePsbtBuilderReturn {
  const [psbt, setPsbt] = useState<PsbtResult | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setPsbt(null);
    setError(null);
  }, []);

  const buildRbf = useCallback(
    async (params: {
      originalTx: MempoolTransaction;
      originalTxHex: string;
      targetFeeRate: number;
      network: BitcoinNetwork;
    }) => {
      setIsBuilding(true);
      setError(null);
      try {
        const { buildRbfPsbt } = await import("@/lib/psbt/rbfBuilder");
        const result = buildRbfPsbt({
          originalTx: params.originalTx,
          originalTxHex: params.originalTxHex,
          targetFeeRate: params.targetFeeRate,
          network: getBitcoinJsNetwork(params.network),
        });
        setPsbt({
          psbtBase64: result.psbtBase64,
          psbtHex: result.psbtHex,
          fee: result.newFee,
          method: "RBF",
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsBuilding(false);
      }
    },
    [],
  );

  const buildCpfp = useCallback(
    async (params: {
      parentTx: MempoolTransaction;
      candidate: CpfpCandidate;
      targetFeeRate: number;
      destinationAddress: string;
      network: BitcoinNetwork;
    }) => {
      setIsBuilding(true);
      setError(null);
      try {
        const { buildCpfpPsbt } = await import("@/lib/psbt/cpfpBuilder");
        const result = buildCpfpPsbt({
          parentTx: params.parentTx,
          candidate: params.candidate,
          targetFeeRate: params.targetFeeRate,
          destinationAddress: params.destinationAddress,
          network: getBitcoinJsNetwork(params.network),
        });
        setPsbt({
          psbtBase64: result.psbtBase64,
          psbtHex: result.psbtHex,
          fee: result.childFee,
          method: "CPFP",
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsBuilding(false);
      }
    },
    [],
  );

  return { psbt, isBuilding, error, buildRbf, buildCpfp, reset };
}
