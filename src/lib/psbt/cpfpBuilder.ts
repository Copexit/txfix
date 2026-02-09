import "@/lib/bitcoin/polyfills";
import { Buffer } from "buffer";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "@bitcoinerlab/secp256k1";
import type { MempoolTransaction } from "@/lib/api/types";
import type { CpfpCandidate } from "@/lib/diagnosis/types";
import { TxFixError, ErrorCode } from "@/lib/errors";
import { ESTIMATED_CHILD_VSIZES, DEFAULT_CHILD_VSIZE } from "@/lib/bitcoin/constants";
import { getDustLimit, isSegWitType } from "./helpers";

bitcoin.initEccLib(ecc);

export interface CpfpPsbtParams {
  parentTx: MempoolTransaction;
  candidate: CpfpCandidate;
  targetFeeRate: number;
  destinationAddress: string;
  network: bitcoin.Network;
}

export interface CpfpPsbtResult {
  psbtBase64: string;
  psbtHex: string;
  childFee: number;
  outputValue: number;
}

export function buildCpfpPsbt(params: CpfpPsbtParams): CpfpPsbtResult {
  const { parentTx, candidate, targetFeeRate, destinationAddress, network } =
    params;
  const psbt = new bitcoin.Psbt({ network });

  // Calculate required child fee
  const parentVsize = parentTx.weight / 4;
  const childVsize =
    ESTIMATED_CHILD_VSIZES[candidate.scriptType] ?? DEFAULT_CHILD_VSIZE;
  const packageVsize = parentVsize + childVsize;
  const requiredPackageFee = Math.ceil(packageVsize * targetFeeRate);
  const childFee = Math.max(requiredPackageFee - parentTx.fee, childVsize);

  const outputValue = candidate.value - childFee;
  if (outputValue < getDustLimit(candidate.scriptType)) {
    throw new TxFixError(
      ErrorCode.CHANGE_OUTPUT_TOO_SMALL,
      "Output value after CPFP fee would be below dust limit.",
    );
  }

  // Add parent output as input
  const inputData: bitcoin.PsbtTxInput = {
    hash: Buffer.from(parentTx.txid, "hex").reverse(),
    index: candidate.outputIndex,
    sequence: 0xfffffffd,
  };
  psbt.addInput(inputData);

  if (isSegWitType(candidate.scriptType)) {
    psbt.updateInput(0, {
      witnessUtxo: {
        script: Buffer.from(candidate.scriptPubKey, "hex"),
        value: BigInt(candidate.value),
      },
    });
  } else {
    throw new TxFixError(
      ErrorCode.UNSUPPORTED_TX_TYPE,
      `CPFP requires a SegWit output but got ${candidate.scriptType}.`,
    );
  }

  // Add output
  psbt.addOutput({
    address: destinationAddress,
    value: BigInt(outputValue),
  });

  return {
    psbtBase64: psbt.toBase64(),
    psbtHex: psbt.toHex(),
    childFee,
    outputValue,
  };
}
