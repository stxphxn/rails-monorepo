import { createPaymentAuth, getReference } from '../helpers/createPaymentAuth';
import { getSwapHash, createSignature, encodeSwapInfo, getSwapData } from '../helpers/signatures';
import { verifySignature } from '../utils/verifySignature';

import {
  PrepareSwapRequestBody,
  PrepareSwapResponse,
} from '../types';
import { escrow } from '../helpers/escrow';

export const prepare = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  const { swapDetails, signature, institutionId, callback } = body;
  try {
    // Check signature was signed by swapDetails.buyer
    // const verified = await verifySignature(swapDetails.buyer, JSON.stringify(swapDetails), signature)
    // if (!verified) {
    //   throw new Error('Buyer signature is not valid');
    // }
    // get seller account information 
    const { accountInfo } = JSON.parse(await SELLERS_DB.get(swapDetails.seller));
    // create swap id
    const swapId = SWAPS_DB.list.length + 1
    // create swap hash
    const swapInfo = {
      ...swapDetails,
      swapId,
    }
    // Create swap hash
    const swapHash = getSwapHash(swapInfo);
    // Create a Pament Initiation Request
    const paymentAuth = await createPaymentAuth(
      swapInfo,
      swapHash,
      accountInfo,
      institutionId,
      callback,
      );
    // create oracle signature 
    const prepareSignature = await createSignature('prepare', swapHash);

    // Send prepare transaction
    const prepareTx = await escrow.prepare(swapInfo, prepareSignature);
    const receipt = await prepareTx.wait();
    const swapEvent = getSwapData(receipt, 'SwapPrepared');

    // Add swap to the db
    const swap = {
      paymentDetails: paymentAuth.paymentRequest,
      swapInfo,
      swapData: swapEvent.swapData,
      prepareSignature,
      reference: getReference(swapHash),
      status: 'PREPARE',
    }
    await SWAPS_DB.put(swapHash, JSON.stringify(swap));
    // response
    const response = {
      swapHash,
      prepareSignature,
      receipt,
      paymentAuth,
      swapInfo,
      swapEvent,
    }
    return new Response(JSON.stringify(response),
      {
        headers: {
          "content-type": 'application/json'
        }
      });
  } catch (e: any) {
    return new Response(e.message)
  }

};