import { fetchAccountDetails } from '../helpers/fetchAccountDetails';
import { createPaymentAuth } from '../helpers/createPaymentAuth';
import { 
  PaymentDetails,
  PrepareSwapRequestBody,
  PrepareSwapResponse,
 } from '../types';

export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  const swapInfo = body.swapInfo;
  // TODO: check signature against swap details

  // fetch seller account details
  const accountDetails = await fetchAccountDetails(swapInfo.seller, body.sellerInstitution);

  // create payment autorisation
  const paymentDetails: PaymentDetails = {
    amount: {
      amount: (swapInfo.amount * swapInfo.exchangeRate),
      currency: swapInfo.currency,
    },
    applicationUserId: swapInfo.buyer,
    institutionId: body.buyerInstititution,
    payeeInfo: {
      accountIdentifications: accountDetails.accountIdentifications,
      name: accountDetails.name,
    },
    swapHash: '' //TODO: create swap hash
  }
  const paymentAuth = await createPaymentAuth(paymentDetails);
  // TODO: create oracle signature 
  
  // response
  const response: PrepareSwapResponse = {
    signature: '', //TODO
    paymentAuth,
  }
  
  return new Response(JSON.stringify(response),
    {
      headers: {
        "content-type": "application/json"
      }
    });
};