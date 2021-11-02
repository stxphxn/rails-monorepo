import { utils } from "ethers";
import { SwapInfo, CurrencyDetails } from "../types";

export const getCurrencyHash = (currencyDetails: CurrencyDetails): string => {
  return utils.keccak256(utils.defaultAbiCoder.encode(
    ['string', 'uint256'],
    [currencyDetails.currency, currencyDetails.exchangeRate],
  ));
};

// export const getSwapHash = (swapInfo: SwapInfo, currencyDetails: CurrencyDetails): string => {
//   const currencyHash = getCurrencyHash(currencyDetails);
//   const {buyer, seller, oracle, token, amount, expiry } = swapInfo;
//   return utils.keccak256(utils.defaultAbiCoder.encode(
//     ['string', 'string', 'string', 'string', 'uint256', 'uint256', 'string'],
//     [buyer, seller, oracle, token, amount, expiry, currencyHash]));
// };
