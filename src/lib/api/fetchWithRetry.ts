import { TxFixError, ErrorCode } from "@/lib/errors";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) return response;

      if (response.status === 404) {
        throw new TxFixError(ErrorCode.TX_NOT_FOUND);
      }
      if (response.status === 429) {
        throw new TxFixError(ErrorCode.API_RATE_LIMITED);
      }

      // 5xx: retry
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      throw new TxFixError(
        ErrorCode.API_UNAVAILABLE,
        `HTTP ${response.status}`,
      );
    } catch (error) {
      if (error instanceof TxFixError) throw error;

      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
    }
  }

  throw new TxFixError(
    ErrorCode.NETWORK_ERROR,
    lastError?.message,
  );
}
