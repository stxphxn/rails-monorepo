import { createPaymentAuth, getReference } from '../helpers/createPaymentAuth';
import { createSignature, getSwapData } from '../helpers/signatures';
// import { verifySignature } from '../utils/verifySignature';

import {
  PrepareSwapRequestBody,
} from '../types';
import { escrow } from '../helpers/escrow';
import { parseEther } from 'ethers/lib/utils';

export const prepare = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  // const { swapDetails, signature, institutionId, callback } = body;
  try {
    // Check signature was signed by swapDetails.buyer
    // const verified = await verifySignature(swapDetails.buyer, JSON.stringify(swapDetails), signature)
    // if (!verified) {
    //   throw new Error('Buyer signature is not valid');
    // }
    // get seller account information 
    const { accountInfo } = JSON.parse(await SELLERS_DB.get(body.swapDetails.seller));
    // create swap id
    const swapId = SWAPS_DB.list.length + 1
    // create swap hash
    const swapInfo = {
      ...body.swapDetails,
      swapId,
    }

    const swapInfoStruct = swapInfo;
    swapInfoStruct.amount =  parseEther(swapInfo.amount.toString());
    
    // Create swap hash
    const swapData = {
      ...swapInfoStruct,
      prepareBlockNumber: 0,
      expiry: 0,
    }


    const swapHash = await escrow.getSwapHash(swapData);
    // const swapHash = getSwapHash(swapInfo);

    // Create a Pament Initiation Request
    const paymentAuth = await createPaymentAuth(
      body.swapDetails,
      swapHash,
      accountInfo,
      body.institutionId,
      body.callback,
      );
    // create oracle signature 
    const prepareSignature = await createSignature('prepare', swapHash);
    
    // Send prepare transaction
    const prepareTx = await escrow.prepare(swapInfoStruct, prepareSignature);
    const receipt = await prepareTx.wait();
    
    const swapEvent = getSwapData(receipt);

    // Add swap to the db
    const swap = {
      authorisationUrl: paymentAuth.authorisationUrl,
      paymentDetails: paymentAuth.paymentRequest,
      swapHash: swapEvent.swapHash,
      swapInfo,
      swapData: swapEvent.swapData,
      prepareSignature,
      reference: getReference(swapHash),
      status: 'PREPARE',
    }
    const swapJson = JSON.stringify(swap);
    await SWAPS_DB.put(swapHash, swapJson);

    const response = {
      message: 'Swap Prepared',
      ...swap,
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