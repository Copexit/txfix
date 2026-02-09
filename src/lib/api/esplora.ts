import { fetchWithRetry } from "./fetchWithRetry";
import type { Utxo } from "./types";

export function createEsploraClient(baseUrl: string) {
  async function get<T>(path: string): Promise<T> {
    const res = await fetchWithRetry(`${baseUrl}${path}`);
    return res.json();
  }

  return {
    getAddressUtxos(address: string): Promise<Utxo[]> {
      return get(`/address/${address}/utxo`);
    },
  };
}

export type EsploraClient = ReturnType<typeof createEsploraClient>;
