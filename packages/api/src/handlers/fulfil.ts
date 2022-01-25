import { checkTransaction } from "../helpers/checkTransaction";
import { escrow } from "../helpers/escrow";
import { createSignature } from "../helpers/signatures";
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
  console.log(swapHash);
  try {
    const json = await SWAPS_DB.get(swapHash);
    const swap = JSON.parse(json);
    console.log(swap);
    if (!swap) throw Error('Swap not found');
    if (swap.status !== 'PREPARE') throw Error('Swap already fulfiled or cancelled');
    // fetch seller consent token
    const { consent, accountInfo: { id } } = JSON.parse(await SELLERS_DB.get(swap.swapInfo.seller));
    console.log(id);
    // check for payment transaction
    const received = await checkTransaction(
      consent,
      id,  
      swapHash, 
      swap.paymentDetails.paymentRequest.amount.amount);
    if (!received) {
      throw new Error('Payment not found');
    }
    // create release signature
    const signature = await createSignature('fulfil', swapHash);

    // send tx
    const fulfilTx = await escrow.fulfil(swap.swapData, signature);
    const receipt = await fulfilTx.wait();
    
    // Update swap status
    swap.status = 'FULFIL';
    await SWAPS_DB.put(swapHash, JSON.stringify(swap));
    
    // response object  
    const response = {
      message: 'Swap Completed',
      transactionHash: receipt.transactionHash,
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
