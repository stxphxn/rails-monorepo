import { BigNumber, ContractReceipt } from 'ethers';
import { defaultAbiCoder, solidityKeccak256, arrayify, splitSignature, Bytes } from 'ethers/lib/utils';

import { wallet } from "../helpers/getWallet";

export const tidy = (str: string): string => `${str.replace(/\n/g, "").replace(/ +/g, " ")}`;

export const SignedDataEncoding = tidy(`tuple(
  string functionIdentifier,
  bytes32 swapHash
)`);


export const getSwapData = async (receipt: ContractReceipt, eventName: string): Promise<any> => {
  const idx = receipt.events?.findIndex((e) => e.event === eventName) ?? -1;
  const decoded = receipt.events![idx].decode!(receipt.events![idx].data, receipt.events![idx].topics);
  return {
    swapHash: decoded[0],
    swapData: {
      buyer: decoded[1][0],
      seller: decoded[1][1],
      oracle: decoded[1][2],
      assetId: decoded[1][3],
      amount: decoded[1][4],
      swapId: decoded[1][5],
      currencyHash: decoded[1][6],
      prepareBlockNumber: decoded[1][7],
      expiry: decoded[1][8],
   }
}
};



export const encodeSignatureData = (type: string, swapHash: Bytes): string => {
  return defaultAbiCoder.encode(
    [SignedDataEncoding],
    [{ functionIdentifier: type, swapHash: swapHash}],
  );
};

const sanitizeSignature = (sig: string): string => {
  if (sig.endsWith('1c') || sig.endsWith('1b')) {
    return sig;
  }

  // Must be sanitized
  const { v } = splitSignature(sig);
  const hex = BigNumber.from(v).toHexString();
  return sig.slice(0, sig.length - 2) + hex.slice(2);
};

export const sign = async (hash: string): Promise<string> => {
  const msg = arrayify(hash);
  return sanitizeSignature(await wallet.signMessage(msg));
};

export const createSignature = async (type: string, swapHash: Bytes): Promise<string> => {
  const payload = encodeSignatureData(type, swapHash);
  const hash = solidityKeccak256(['bytes'], [payload]);
  return sign(hash);
}