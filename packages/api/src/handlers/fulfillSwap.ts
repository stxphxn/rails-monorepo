import { checkTransaction } from "../helpers/checkTransaction";
import { fetchConsentToken } from "../helpers/fetchConsentToken";
import { SwapInfo } from "../types";
import { getSwapHash } from "../utils/getSwapHash";

export type FulfillSwapRequestBody = {
  swapInfo: SwapInfo,
  sellerInstitution: string,
}

export const fulfillSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: FulfillSwapRequestBody = await request.json();
  const { swapInfo } = body;

  // TODO: check for valid swap hash 
  const swapHash = getSwapHash(swapInfo, );
  // TODO: fetch seller consent token
  const { consentToken, id } = await fetchConsentToken(swapInfo.seller, body.sellerInstitution);
  
  // TODO: check for payment transaction
  const received = await checkTransaction(consentToken, id,  swapHash, swapInfo.amount);
  // TODO: create release signature

  return new Response('response',
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};
