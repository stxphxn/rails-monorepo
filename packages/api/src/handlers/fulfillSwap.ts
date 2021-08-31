import { fetchConsentToken } from "../helpers/fetchConsentToken";
import { SwapInfo } from "../types";

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

  // TODO: fetch seller consent token
  const { consentToken } = await fetchConsentToken(swapInfo.seller, body.sellerInstitution);
  
  // TODO: check for payment transaction

  // TODO: create release signature

  return new Response('response',
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};
