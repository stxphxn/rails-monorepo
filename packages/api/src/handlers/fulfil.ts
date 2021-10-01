import { checkTransaction } from "../helpers/checkTransaction";
import { fetchConsentToken } from "../helpers/fetchConsentToken";
import { CurrencyDetails, SwapInfo } from "../types";
import { getSwapHash } from "../utils/getSwapHash";

export type FulfillSwapRequestBody = {
  swapInfo: SwapInfo,
  sellerInstitution: string,
  currencyDetails: CurrencyDetails
}

export const fulfil = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: FulfillSwapRequestBody = await request.json();
  const { swapInfo, currencyDetails } = body;

  // TODO: check for valid swap hash 
  const swapHash = getSwapHash(swapInfo, currencyDetails);
  
  // TODO: fetch seller consent token
  const { consentToken, id } = await fetchConsentToken(swapInfo.seller, body.sellerInstitution);
  
  // TODO: check for payment transaction
  const received = await checkTransaction(consentToken, id,  swapHash, swapInfo.amount);
  if (!received) {
    throw new Error('Payment not found');
  }
  
  // TODO: create release signature


  return new Response('response',
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};

// pull seller crypto to arbiter

// 