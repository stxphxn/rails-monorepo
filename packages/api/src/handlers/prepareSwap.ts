import { fetchAccountDetails } from '../helpers/fetchAccountDetails';
import { createPaymentAuth } from '../helpers/createPaymentAuth';
import { 
  PaymentDetails,
  PrepareSwapRequestBody,
  PrepareSwapResponse,
  Signature,
 } from '../types';
import { getSwapHash } from '../utils/getSwapHash';
import { verifySignature } from '../utils/verifySignature';

export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body: PrepareSwapRequestBody = await request.json();
  const {swapInfo, currencyDetails, signatures} = body;
  
  // check signature against swap details
  const swapHash = getSwapHash(swapInfo, currencyDetails);
  const verifySig = (signature: Signature) => verifySignature(signature.address, swapHash, signature.sig);
  if (!signatures.every(verifySig)) throw Error('invalid signature/s');
  
  // fetch seller account details
  const accountDetails = await fetchAccountDetails(swapInfo.seller, body.sellerInstitution);

  // create payment autorisation
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