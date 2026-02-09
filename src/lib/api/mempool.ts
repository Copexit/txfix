import { TxFixError, ErrorCode } from "@/lib/errors";
import { fetchWithRetry } from "./fetchWithRetry";
import type {
  MempoolTransaction,
  TxStatus,
  RecommendedFees,
  MempoolBlock,
  MempoolInfo,
  OutspendStatus,
  PriceData,
} from "./types";

export function createMempoolClient(baseUrl: string) {
  async function get<T>(path: string): Promise<T> {
    const res = await fetchWithRetry(`${baseUrl}${path}`);
    try {
      return await res.json();
    } catch {
      throw new TxFixError(ErrorCode.API_UNAVAILABLE, "Invalid JSON response");
    }
  }

  async function getText(path: string): Promise<string> {
    const res = await fetchWithRetry(`${baseUrl}${path}`);
    return res.text();
  }

  return {
    getTransaction(txid: string): Promise<MempoolTransaction> {
      return get(`/tx/${txid}`);
    },

    getTxStatus(txid: string): Promise<TxStatus> {
      return get(`/tx/${txid}/status`);
    },

    getTxHex(txid: string): Promise<string> {
      return getText(`/tx/${txid}/hex`);
    },

    getTxOutspends(txid: string): Promise<OutspendStatus[]> {
      return get(`/tx/${txid}/outspends`);
    },

    getRecommendedFees(): Promise<RecommendedFees> {
      return get("/v1/fees/recommended");
    },

    getMempoolBlocks(): Promise<MempoolBlock[]> {
      return get("/v1/fees/mempool-blocks");
    },

    getMempoolInfo(): Promise<MempoolInfo> {
      return get("/mempool");
    },

    async broadcastTx(hex: string): Promise<string> {
      const res = await fetchWithRetry(`${baseUrl}/tx`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: hex,
      });
      return res.text();
    },

    async getPrice(): Promise<number> {
      try {
        const data: PriceData = await get("/v1/prices");
        return data.USD;
      } catch {
        return 100_000; // Fallback estimate
      }
    },
  };
}

export type MempoolClient = ReturnType<typeof createMempoolClient>;
