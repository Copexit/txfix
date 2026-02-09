/**
 * Format satoshis with comma separators.
 * Example: 12345 → "12,345 sats"
 */
export function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}

/**
 * Convert satoshis to USD as a number.
 * Returns 0 if btcPrice is 0 or negative.
 */
export function satsToUsd(sats: number, btcPrice: number): number {
  if (btcPrice <= 0) return 0;
  return (sats / 100_000_000) * btcPrice;
}

/**
 * Format satoshis as BTC.
 * Example: 12345 → "0.00012345 BTC"
 */
export function formatBtc(sats: number): string {
  return `${(sats / 100_000_000).toFixed(8)} BTC`;
}

/**
 * Format a fee rate for display.
 * Example: 18.5 → "18.5 sat/vB"
 */
export function formatFeeRate(satPerVb: number): string {
  return `${satPerVb.toFixed(1)} sat/vB`;
}

/**
 * Truncate a TXID for display.
 * Example: "abcdef1234...5678abcdef" → "abcdef12…ef123456"
 */
export function truncateTxid(txid: string, chars: number = 8): string {
  if (txid.length <= chars * 2) return txid;
  return `${txid.slice(0, chars)}…${txid.slice(-chars)}`;
}

/**
 * Convert satoshis to approximate USD (formatted string).
 */
export function satsToDollars(sats: number, btcPriceUsd: number): string {
  const dollars = satsToUsd(sats, btcPriceUsd);
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format a duration estimate from blocks.
 * Example: 1 → "~10 min", 6 → "~1 hour", 144 → "~1 day"
 */
export function formatBlockEstimate(blocks: number): string {
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes} min`;
  if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `~${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const days = Math.round(minutes / 1440);
  return `~${days} day${days !== 1 ? "s" : ""}`;
}

/**
 * Validate a transaction ID (64-char hex string).
 */
export function isValidTxid(value: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(value);
}
