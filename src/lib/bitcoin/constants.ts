export const MAX_SEQUENCE = 0xffffffff;
export const RBF_MAX_SEQUENCE = 0xfffffffd;
export const LOCKTIME_THRESHOLD = 500_000_000;

/** Dust limits by output script type (in satoshis) */
export const DUST_LIMITS: Record<string, number> = {
  v0_p2wpkh: 294,
  v0_p2wsh: 330,
  v1_p2tr: 294,
  p2pkh: 546,
  p2sh: 540,
};

export const DEFAULT_DUST_LIMIT = 546;

/** Estimated virtual sizes for 1-input-1-output transactions by script type */
export const ESTIMATED_CHILD_VSIZES: Record<string, number> = {
  v0_p2wpkh: 110,
  v1_p2tr: 111,
  v0_p2wsh: 140,
  p2sh: 148,
  p2pkh: 192,
};

export const DEFAULT_CHILD_VSIZE = 150;

