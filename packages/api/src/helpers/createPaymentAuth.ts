import authCall from "../utils/authCall";
import { PaymentDetails, PaymentRequest, PaymentAuthResponse } from "../types";



export const getReference = (hash: string): string => {
  return hash.substring(0, 10);
}

export const createPaymentAuth = async (
  paymentDetails: PaymentDetails,
): Promise<PaymentAuthResponse> => {

  const {
    amount,
    applicationUserId,
    institutionId,
    payeeInfo: { accountIdentifications, name },
    swapHash,
  } = paymentDetails;
  
  const paymentRequest: PaymentRequest = {
    amount,
    payee: {
      accountIdentifications,
      address: {
        country: 'GB',
      },
      name,
    },
    paymentIdempotencyId: swapHash,
    reference: getReference(swapHash),
    type: 'DOMESTIC_INSTANT_PAYMENT',
  }

  const reqBody = {
    applicationUserId,
    institutionId,
    callback: 'https://display-parameters.com/',
    paymentRequest,
  };
  
  const paymentAuth =  await authCall('https://api.yapily.com/payment-auth-requests', reqBody, 'POST');
  return {
    paymentRequest,
    authorisationUrl: paymentAuth.data.authorisationUrl,
    id: paymentAuth.data.id,
    userUuid: paymentAuth.data.userUuid,
  };
};