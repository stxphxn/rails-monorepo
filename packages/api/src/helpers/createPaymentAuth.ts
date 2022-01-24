import authCall from "../utils/authCall";
import { PaymentRequest, PaymentAuthResponse, SwapInfo } from "../types";



export const getReference = (hash: string): string => {
  return hash.substring(0, 10);
}

export const createPaymentAuth = async (
  swapInfo: SwapInfo,
  swapHash: string,
  accountInfo: any,
  institutionId: string,
  callback: string,
): Promise<PaymentAuthResponse> => {
  // fetch exchange rate
  const exchangeRate = 0.75;
  
  const paymentRequest: PaymentRequest = {
    type: 'DOMESTIC_INSTANT_PAYMENT',
    reference: getReference(swapHash),
    paymentIdempotencyId: swapHash,
    amount: {
      amount: (swapInfo.amount * exchangeRate),
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
  return {
    paymentRequest: reqBody,
    authorisationUrl: paymentAuth.data.authorisationUrl,
    id: paymentAuth.data.id,
    userUuid: paymentAuth.data.userUuid,
  };
};