import "@/lib/bitcoin/polyfills";
import { Buffer } from "buffer";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "@bitcoinerlab/secp256k1";
import type { MempoolTransaction } from "@/lib/api/types";
import { TxFixError, ErrorCode } from "@/lib/errors";
import { RBF_MAX_SEQUENCE } from "@/lib/bitcoin/constants";
import {
  identifyChangeOutput,
  isSegWitInput,
  getDustLimit,
  extractRedeemScript,
} from "./helpers";

bitcoin.initEccLib(ecc);

export interface RbfPsbtParams {
  originalTx: MempoolTransaction;
  originalTxHex: string;
  /** Map from input txid → raw tx hex (for non-SegWit inputs needing nonWitnessUtxo) */
  inputTxHexMap?: Record<string, string>;
  targetFeeRate: number;
  network: bitcoin.Network;
}

export interface RbfPsbtResult {
  psbtBase64: string;
  psbtHex: string;
  newFee: number;
  additionalFee: number;
  changeOutputIndex: number;
}

export function buildRbfPsbt(params: RbfPsbtParams): RbfPsbtResult {
  const { originalTx, originalTxHex, inputTxHexMap, targetFeeRate, network } = params;
  const psbt = new bitcoin.Psbt({ network });

  const vsize = originalTx.weight / 4;
  const newFee = Math.ceil(vsize * targetFeeRate);
  const feeDelta = newFee - originalTx.fee;

  if (feeDelta <= 0) {
    throw new TxFixError(
      ErrorCode.PSBT_CONSTRUCTION_FAILED,
      "New fee is not higher than original fee.",
    );
  }

  // Identify change output
  const changeIndex = identifyChangeOutput(originalTx);
  if (changeIndex === -1) {
    throw new TxFixError(
      ErrorCode.PSBT_CONSTRUCTION_FAILED,
      "Cannot identify change output for fee adjustment.",
    );
  }

  const changeOutput = originalTx.vout[changeIndex];
  const newChangeValue = changeOutput.value - feeDelta;
  if (newChangeValue < getDustLimit(changeOutput.scriptpubkey_type)) {
    throw new TxFixError(ErrorCode.CHANGE_OUTPUT_TOO_SMALL);
  }

  // Add inputs
  for (const vin of originalTx.vin) {
    const inputData: bitcoin.PsbtTxInput = {
      hash: Buffer.from(vin.txid, "hex").reverse(),
      index: vin.vout,
      sequence: Math.min(vin.sequence, RBF_MAX_SEQUENCE),
    };

    psbt.addInput(inputData);

    const inputIndex = psbt.inputCount - 1;

    if (isSegWitInput(vin)) {
      psbt.updateInput(inputIndex, {
        witnessUtxo: {
          script: Buffer.from(vin.prevout.scriptpubkey, "hex"),
          value: BigInt(vin.prevout.value),
        },
      });
    } else {
      // Non-segwit: need full previous transaction hex for this specific input
      const prevTxHex = inputTxHexMap?.[vin.txid] ?? originalTxHex;
      if (!prevTxHex) {
        throw new TxFixError(
          ErrorCode.PSBT_CONSTRUCTION_FAILED,
          `Missing raw transaction hex for legacy input ${vin.txid}`,
        );
      }
      psbt.updateInput(inputIndex, {
        nonWitnessUtxo: Buffer.from(prevTxHex, "hex"),
      });
    }

    // P2SH-wrapped SegWit: add redeemScript
    if (
      vin.prevout.scriptpubkey_type === "p2sh" &&
      vin.witness &&
      vin.witness.length > 0
    ) {
      psbt.updateInput(inputIndex, {
        redeemScript: Buffer.from(extractRedeemScript(vin.scriptsig)),
      });
    }
  }

  // Add outputs
  for (let i = 0; i < originalTx.vout.length; i++) {
    const vout = originalTx.vout[i];
    const value = i === changeIndex ? newChangeValue : vout.value;

    psbt.addOutput({
      script: Buffer.from(vout.scriptpubkey, "hex"),
      value: BigInt(value),
    });
  }

  return {
    psbtBase64: psbt.toBase64(),
    psbtHex: psbt.toHex(),
    newFee,
    additionalFee: feeDelta,
    changeOutputIndex: changeIndex,
  };
}
