import { fetchAccountDetails } from '../helpers/fetchAccountDetails';
import { createPaymentAuth, getReference } from '../helpers/createPaymentAuth';

import { getSwapHash, createSignature, encodeSwapInfo, getCurrencyHash } from '../helpers/signatures';

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
  const {swapDetails, signatures, currencyDetails} = body;
  // get swap details Hash
  const 

  // check buyer signature

  // check valid seller and has liquidity  

  const { consentToken, currencyHash } = JSON.parse(await SELLERS_DB.get(swapDetails.seller));

  // create swap id
  const swapId = SWAPS_DB.list.length + 1

 
  // create swap hash
  // const currencyHash = getCurrencyHash(currencyDetails);
  const swapInfo = {
    ...swapDetails,
    swapId,
    currencyHash,
  }
  const encodedSwapInfo = encodeSwapInfo(swapInfo);
  const swapHash = getSwapHash(encodedSwapInfo);
  


  // fetch seller account details
  const accountDetails = await fetchAccountDetails(consentToken);

  // create payment autorisations
  const paymentDetails: PaymentDetails = {
    amount: {
      amount: (swapInfo.amount * currencyDetails.exchangeRate),
      currency: currencyDetails.currency,
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
  const signature = await createSignature('prepare', swapHash);

  // Add swap tothe db
  const swap = {
    paymentDetails,
    swapInfo,
    currencyDetails,
    signature,
    reference: getReference(swapHash),
    status: 'PREPARE',
  }

  await SWAPS_DB.put(swapHash, JSON.stringify(swap));
  
  // response
  const response: PrepareSwapResponse = {
    signature,
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