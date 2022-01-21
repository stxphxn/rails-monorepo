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
  try {
    const swap = JSON.parse(await SWAPS_DB.get(swapHash));
    if (!swap) throw Error('Swap not found');
    if (swap.status !== 'PREPARE') throw Error('Swap already fulfiled or cancelled');
    // fetch seller consent token
    const { consentToken, institutionId } = JSON.parse(await SELLERS_DB.get(swap.swapData.seller));
    // check for payment transaction
    const received = await checkTransaction(consentToken, institutionId,  swapHash, swap.swapData.amount);
    if (!received) {
      throw new Error('Payment not found');
    }
    // create release signature
    const signature = await createSignature('fulfil', swapHash);
    // response object  
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
  } catch(e: any) {
    return new Response(e.message)
  }
};
