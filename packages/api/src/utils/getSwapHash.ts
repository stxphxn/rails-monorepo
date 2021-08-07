import { utils } from "ethers";
import { SwapInfo } from "../types";

export const getSwapHash = (swapInfo: SwapInfo): string => {
  const {buyer, seller, oracle, token, amount, expiry } = swapInfo;
  return utils.keccak256(utils.defaultAbiCoder.encode(
    ['string', 'string', 'string', 'string', 'int256', 'int256'],
    [buyer, seller, oracle, token, amount, expiry]));
};
