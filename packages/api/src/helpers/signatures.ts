import { BigNumber, ContractReceipt } from 'ethers';
import { defaultAbiCoder, solidityKeccak256, arrayify, splitSignature, Bytes, Interface } from 'ethers/lib/utils';

import { wallet } from "../helpers/getWallet";
import { SwapInfo, CurrencyDetails, SwapData } from '../types';

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
)`)


export const getSwapData = (receipt: ContractReceipt): any => {
  const abi = [ 'event SwapPrepared(bytes32 swapHash,(address,address,address,address,uint256,uint256,uint256,uint256) swapData, address caller)'];
  const iface = new Interface(abi);
  const log = iface.parseLog(receipt.logs[0]);
  const {swapHash, swapData } = log.args;
  
  return {
    swapHash,
    swapData: {
      buyer: swapData[0],
      seller: swapData[1],
      oracle: swapData[2],
      assetId: swapData[3],
      amount:  swapData[4],
      swapId:  swapData[5],
      prepareBlockNumber: swapData[6],
      expiry:  swapData[7],
    },
  }
};

export const encodeSwapInfo = (swapInfo: SwapInfo | SwapData): string => {
  const {buyer, seller, oracle, assetId, amount, swapId } = swapInfo
  return defaultAbiCoder.encode(
    [SwapInfoEncoding],
    [{
      buyer,
      seller,
      oracle, 
      assetId, 
      amount, 
      swapId,
    }],
  )
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

export const getSwapHash = (swapInfo: SwapInfo): string => {
  const encoded = encodeSwapInfo(swapInfo);
  return solidityKeccak256(['bytes'],[encoded]);
}

export const createSignature = async (type: string, swapHash: string): Promise<string> => {
  const payload = encodeSignatureData(type, arrayify(swapHash));
  const hash = solidityKeccak256(['bytes'], [payload]);
  return sign(hash);
}