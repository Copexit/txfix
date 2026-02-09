// ── Transaction ──────────────────────────────────────────────────────────────

export interface MempoolTransaction {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  vin: MempoolVin[];
  vout: MempoolVout[];
  status: TxStatus;
}

export interface MempoolVin {
  txid: string;
  vout: number;
  prevout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  witness?: string[];
  is_coinbase: boolean;
  sequence: number;
}

export interface MempoolVout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

export interface TxStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

// ── Fees ─────────────────────────────────────────────────────────────────────

export interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

// ── Mempool ──────────────────────────────────────────────────────────────────

export interface MempoolBlock {
  blockSize: number;
  blockVSize: number;
  nTx: number;
  totalFees: number;
  medianFee: number;
  feeRange: number[];
}

export interface MempoolInfo {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: [number, number][];
}

// ── Outspends ────────────────────────────────────────────────────────────────

export interface OutspendStatus {
  spent: boolean;
  txid?: string;
  vin?: number;
  status?: TxStatus;
}

// ── UTXOs ────────────────────────────────────────────────────────────────────

export interface Utxo {
  txid: string;
  vout: number;
  value: number;
  status: TxStatus;
}

// ── Price ────────────────────────────────────────────────────────────────────

export interface PriceData {
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  CHF: number;
  AUD: number;
  JPY: number;
}
