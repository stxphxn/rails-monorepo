import { fetchAccountDetails } from '../helpers/fetchAccountDetails';
import { createPaymentAuth, getReference } from '../helpers/createPaymentAuth';

import { getSwapHash, createSignature, encodeSwapInfo } from '../helpers/signatures';

import { 
  PaymentDetails,
  PrepareSwapRequestBody,
  PrepareSwapResponse,
 } from '../types';

export const prepare = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  const {swapDetails, signature } = body;

  // check buyer signature
  // hash swap details
  // check sig 

  // get seller consent token   
  const { consentToken } = JSON.parse(await SELLERS_DB.get(swapDetails.seller));

  // create swap id
  const swapId = SWAPS_DB.list.length + 1

  // create swap hash
  const swapInfo = {
    ...swapDetails,
    swapId,
  }
  const encodedSwapInfo = encodeSwapInfo(swapInfo);
  const swapHash = getSwapHash(encodedSwapInfo);
  
  // fetch exchange rate
  const exchangeRate = 1;

  // fetch seller account details
  const accountDetails = await fetchAccountDetails(consentToken);

  // create payment autorisations
  const paymentDetails: PaymentDetails = {
    amount: {
      amount: (swapInfo.amount * exchangeRate),
      currency: 'GBP',
    },
    applicationUserId: swapInfo.buyer,
    institutionId: body.buyerInstititution,
    payeeInfo: {
      accountIdentifications: accountDetails.accountIdentifications,
      name: accountDetails.name,
    },
    swapHash,
  }
  const paymentAuth = await createPaymentAuth(paymentDetails);
  
  // create oracle signature 
  const prepareSignature = await createSignature('prepare', swapHash);

  // Add swap tothe db
  const swap = {
    paymentDetails,
    swapInfo,
    prepareSignature,
    reference: getReference(swapHash),
    status: 'PREPARE',
  }

  await SWAPS_DB.put(swapHash, JSON.stringify(swap));
  
  // response
  const response: PrepareSwapResponse = {
    prepareSignature,
    paymentAuth,
    encodedSwapInfo,
    swapInfo,
  }
  
  return new Response(JSON.stringify(response),
    {
      headers: {
        "content-type": 'application/json'
      }
    });
};