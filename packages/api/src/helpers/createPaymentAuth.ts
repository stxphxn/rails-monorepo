import authCall from "../utils/authCall";
import { PaymentRequest, PaymentAuthResponse, SwapInfo, SwapDetails } from "../types";
import { Console } from "console";



export const getReference = (hash: string): string => {
  return hash.substring(0, 10);
}

export const getPaymentId = (hash: string): string => {
  return hash.substring(0, 34);
}

export const createPaymentAuth = async (
  swapInfo: SwapDetails,
  swapHash: string,
  accountInfo: any,
  institutionId: string,
  callback: string,
): Promise<PaymentAuthResponse> => {
  // fetch exchange rate
  const exchangeRate = 0.75;
  console.log(swapInfo.amount);
  const paymentRequest: PaymentRequest = {
    type: 'DOMESTIC_PAYMENT',
    reference: getReference(swapHash),
    paymentIdempotencyId: getPaymentId(swapHash),
    amount: {
      amount: (swapInfo.amount as number * exchangeRate),
      currency: 'GBP',
    },
    payee: {
      accountIdentifications: accountInfo.accountIdentifications,
      address: {
        country: 'GB',
      },
      name: accountInfo.accountNames[0].name,
    },
  }

  const reqBody = {
    applicationUserId: swapInfo.buyer,
    institutionId,
    callback,
    paymentRequest,
  };
  
  const paymentAuth =  await authCall('https://api.yapily.com/payment-auth-requests', reqBody, 'POST');
  console.log(paymentAuth);
  return {
    paymentRequest,
    authorisationUrl: paymentAuth.data.authorisationUrl,
    id: paymentAuth.data.id,
    userUuid: paymentAuth.data.userUuid,
  };
};