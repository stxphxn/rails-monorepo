import { BigNumber, ContractReceipt } from 'ethers';
import { defaultAbiCoder, solidityKeccak256, arrayify, splitSignature, Bytes } from 'ethers/lib/utils';

import { wallet } from "../helpers/getWallet";
import { SwapInfo, CurrencyDetails } from '../types';

export const tidy = (str: string): string => `${str.replace(/\n/g, "").replace(/ +/g, " ")}`;

export const SignedDataEncoding = tidy(`tuple(
  string functionIdentifier,
  bytes32 swapHash
)`);

export const SwapInfoEncoding = tidy(`tuple(
  address buyer,
  address seller,
  address oracle,
  address assetId,
  uint256 amount,
  uint256 swapId,
  string currencyHash,
)`)


export const getSwapData = async (receipt: ContractReceipt, eventName: string) => {
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

export const getCurrencyHash = (currencyDetails: CurrencyDetails): string => {
  return solidityKeccak256(['bytes'],[defaultAbiCoder.encode(
    ['string', 'uint256'],
    [currencyDetails.currency, currencyDetails.exchangeRate],
  )]);
};

export const getSwapHash = (swapInfo: SwapInfo, currencyDetails: CurrencyDetails): string => {
  const currencyHash = getCurrencyHash(currencyDetails);

  return solidityKeccak256(['bytes'],[defaultAbiCoder.encode(
    [SwapInfoEncoding],
    [{
      buyer: swapInfo.buyer,
      seller: swapInfo.seller,
      oracle: swapInfo.oracle,
      assetId: swapInfo.assetId,
      amount: swapInfo.amount,
      swapId: 1,
      currencyHash: currencyHash, 
    }],
  )]);
}

export const createSignature = async (type: string, swapHash: string): Promise<string> => {
  const payload = encodeSignatureData(type, arrayify(swapHash));
  const hash = solidityKeccak256(['bytes'], [payload]);
  return sign(hash);
}