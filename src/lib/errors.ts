export enum ErrorCode {
  INVALID_TXID = "INVALID_TXID",
  TX_NOT_FOUND = "TX_NOT_FOUND",
  TX_ALREADY_CONFIRMED = "TX_ALREADY_CONFIRMED",
  API_UNAVAILABLE = "API_UNAVAILABLE",
  API_RATE_LIMITED = "API_RATE_LIMITED",
  NETWORK_ERROR = "NETWORK_ERROR",
  PSBT_CONSTRUCTION_FAILED = "PSBT_CONSTRUCTION_FAILED",
  CHANGE_OUTPUT_TOO_SMALL = "CHANGE_OUTPUT_TOO_SMALL",
  NO_RESCUE_POSSIBLE = "NO_RESCUE_POSSIBLE",
  BROADCAST_FAILED = "BROADCAST_FAILED",
  UNSUPPORTED_TX_TYPE = "UNSUPPORTED_TX_TYPE",
}

const USER_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_TXID]:
    "Invalid transaction ID. Please enter a 64-character hex string.",
  [ErrorCode.TX_NOT_FOUND]:
    "Transaction not found. Check the TXID and make sure you selected the right network.",
  [ErrorCode.TX_ALREADY_CONFIRMED]:
    "This transaction is already confirmed. No action needed.",
  [ErrorCode.API_UNAVAILABLE]:
    "mempool.space is temporarily unavailable. Try again in a moment.",
  [ErrorCode.API_RATE_LIMITED]:
    "Too many requests. Please wait a moment and try again.",
  [ErrorCode.NETWORK_ERROR]:
    "Could not reach mempool.space. Check your internet connection.",
  [ErrorCode.PSBT_CONSTRUCTION_FAILED]:
    "Failed to construct the replacement transaction. The transaction format may not be supported.",
  [ErrorCode.CHANGE_OUTPUT_TOO_SMALL]:
    "The change output is too small to absorb the fee increase. Try CPFP instead.",
  [ErrorCode.NO_RESCUE_POSSIBLE]:
    "Neither RBF nor CPFP are available for this transaction.",
  [ErrorCode.BROADCAST_FAILED]:
    "Failed to broadcast the transaction. The network may have rejected it.",
  [ErrorCode.UNSUPPORTED_TX_TYPE]:
    "This transaction type is not currently supported for rescue.",
};

export class TxFixError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;

  constructor(code: ErrorCode, detail?: string) {
    const userMessage = USER_MESSAGES[code];
    super(detail || userMessage);
    this.code = code;
    this.userMessage = detail
      ? `${userMessage} ${detail}`
      : userMessage;
  }
}
