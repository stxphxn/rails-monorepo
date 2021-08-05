import { fetchAccountDetails } from '../helpers/fetchAccountDetails';
import { createPaymentAuth } from '../helpers/createPaymentAuth';
import { PaymentDetails, PaymentAuthResponse } from '../types';

type SwapDetails = {
  buyer: string,
  seller: string,
  currency: string,
  token: string,
  exchangeRate: number,
  amount: number,
  expiry: number,
}

type PrepareSwapRequestBody = {
  swapDetails: SwapDetails,
  sellerInstitution: string,
  buyerInstititution: string,
}

type PrepareSwapResponse = {
  signature: string,
  paymentAuth: PaymentAuthResponse,
}


export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  const swapDetails = body.swapDetails;
  // TODO: check signature against swap details
  // fetch seller account details
  const accountDetails = await fetchAccountDetails(swapDetails.seller, body.sellerInstitution);

  // create payment autorisation
  const paymentDetails: PaymentDetails = {
    amount: {
      amount: (swapDetails.amount * swapDetails.exchangeRate),
      currency: swapDetails.currency,
    },
    applicationUserId: swapDetails.buyer,
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