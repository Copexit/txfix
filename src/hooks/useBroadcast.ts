"use client";

import { useState, useCallback } from "react";
import { useNetwork } from "@/context/NetworkContext";
import { createMempoolClient } from "@/lib/api/mempool";
import { TxFixError, ErrorCode } from "@/lib/errors";

interface BroadcastResult {
  txid: string | null;
  isLoading: boolean;
  error: Error | null;
  broadcast: (hex: string) => Promise<string | null>;
  reset: () => void;
}

export function useBroadcast(): BroadcastResult {
  const { config } = useNetwork();
  const [txid, setTxid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const broadcast = useCallback(
    async (hex: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      setTxid(null);

      try {
        const client = createMempoolClient(config.mempoolBaseUrl);
        const resultTxid = await client.broadcastTx(hex);
        setTxid(resultTxid);
        return resultTxid;
      } catch (err) {
        const error =
          err instanceof TxFixError
            ? err
            : new TxFixError(
                ErrorCode.BROADCAST_FAILED,
                err instanceof Error ? err.message : String(err),
              );
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config.mempoolBaseUrl],
  );

  const reset = useCallback(() => {
    setTxid(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { txid, isLoading, error, broadcast, reset };
}
