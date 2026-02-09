"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNetwork } from "@/context/NetworkContext";
import { createMempoolClient } from "@/lib/api/mempool";

type TrackerStatus = "pending" | "in-mempool" | "confirmed";

interface LiveTrackerResult {
  status: TrackerStatus;
  blockHeight: number | null;
  error: Error | null;
}

const POLL_INTERVAL = 10_000; // 10 seconds

export function useLiveTracker(
  txid: string | null,
  onConfirmed?: () => void,
): LiveTrackerResult {
  const { config } = useNetwork();
  const [status, setStatus] = useState<TrackerStatus>("pending");
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const confirmedRef = useRef(false);
  const onConfirmedRef = useRef(onConfirmed);

  useEffect(() => {
    onConfirmedRef.current = onConfirmed;
  }, [onConfirmed]);

  // Reset state during render when txid changes (React recommended pattern)
  const [prevTxid, setPrevTxid] = useState<string | null>(null);
  if (txid !== prevTxid) {
    setPrevTxid(txid);
    setStatus("pending");
    setBlockHeight(null);
    setError(null);
  }

  const checkStatus = useCallback(
    async (id: string) => {
      try {
        const client = createMempoolClient(config.mempoolBaseUrl);
        const txStatus = await client.getTxStatus(id);

        if (txStatus.confirmed) {
          setStatus("confirmed");
          setBlockHeight(txStatus.block_height ?? null);
          if (!confirmedRef.current) {
            confirmedRef.current = true;
            onConfirmedRef.current?.();
          }
        } else {
          setStatus("in-mempool");
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [config.mempoolBaseUrl],
  );

  useEffect(() => {
    if (!txid) return;

    confirmedRef.current = false;

    // Initial check deferred to avoid synchronous setState in effect
    const initialTimeout = setTimeout(() => checkStatus(txid), 0);

    const interval = setInterval(() => {
      if (confirmedRef.current) return;
      checkStatus(txid);
    }, POLL_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [txid, checkStatus]);

  return { status, blockHeight, error };
}
