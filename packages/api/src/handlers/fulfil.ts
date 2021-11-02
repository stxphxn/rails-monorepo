import { checkTransaction } from "../helpers/checkTransaction";
import { fetchConsentToken } from "../helpers/fetchConsentToken";
import { createSignature, getSwapHash } from "../helpers/signatures";
import { CurrencyDetails, SwapInfo } from "../types";

export type FulfilSwapRequestBody = {
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
  const body: FulfilSwapRequestBody = await request.json();
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
  const signature = await createSignature('fulfil', swapHash);

  const response = {
    signature,
  }

  return new Response(JSON.stringify(response),
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};

// pull seller crypto to arbiter

// 