"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  type BitcoinNetwork,
  DEFAULT_NETWORK,
  isValidNetwork,
} from "@/lib/bitcoin/networks";
import { isValidTxid } from "@/lib/bitcoin/format";

export function useUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawNetwork = searchParams.get("network") ?? "";
  const network: BitcoinNetwork = isValidNetwork(rawNetwork)
    ? rawNetwork
    : DEFAULT_NETWORK;

  const txid = searchParams.get("tx");

  const setTxid = useCallback(
    (newTxid: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTxid && isValidTxid(newTxid)) {
        params.set("tx", newTxid);
      } else {
        params.delete("tx");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const setNetwork = useCallback(
    (newNetwork: BitcoinNetwork) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newNetwork === DEFAULT_NETWORK) {
        params.delete("network");
      } else {
        params.set("network", newNetwork);
      }
      params.delete("tx");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return { txid, network, setTxid, setNetwork };
}
