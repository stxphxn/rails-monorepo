import authCall from "../utils/authCall";
import { PaymentDetails, PaymentRequest } from "../types";

const getReference = (hash: string): string => {
  return hash.substring(0, 10);
}

export const createPaymentAuth = async (
  paymentDetails: PaymentDetails,
): Promise<string> => {

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
  
  return authCall('https://api.yapily.com/payment-auth-requests', reqBody, 'POST');
};