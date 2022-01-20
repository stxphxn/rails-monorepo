import { checkTransaction } from "../helpers/checkTransaction";
import { createSignature, encodeSwapInfo, getSwapHash } from "../helpers/signatures";
import { SwapData } from "../types";

export type FulfilSwapRequestBody = {
  swapHash: string,
  swapData: SwapData,
  sellerInstitution: string,
}

export const fulfil = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: FulfilSwapRequestBody = await request.json();
  const { swapHash } = body;

  const swap = JSON.parse(await SWAPS_DB.get(swapHash));
  if (!swap) throw Error('Swap not found');
  if (swap.status !== 'PREPARE') throw Error('Swap already fulfiled');
  // TODO: fetch seller consent token
  const { consentToken, id } = JSON.parse(await SELLERS_DB.get(swap.swapData.seller));
  
  // TODO: check for payment transaction
  const received = await checkTransaction(consentToken, id,  swapHash, swap.swapData.amount);
  if (!received) {
    throw new Error('Payment not found');
  }
  
  // TODO: create release signature
  const signature = await createSignature('fulfil', swapHash);

  

  const response = {
    swapData: swap.swapData,
    signature,
  }

  return new Response(JSON.stringify(response),
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};
