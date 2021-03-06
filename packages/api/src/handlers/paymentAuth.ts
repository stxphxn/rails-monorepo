import authCall from "../utils/authCall";
import { PaymentRequest } from "../types";


const paymentAuth = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const body = await request.json();

  // check parameters are valid
  const reqBody = {
    applicationUserId: body.applicationUserId,
    institutionId: body.institutionId,
    callback: 'https://display-parameters.com/',
    paymentRequest: body.paymentRequest as PaymentRequest,
  };

  // call api
  const data = await authCall('https://api.yapily.com/payment-auth-requests', reqBody, 'POST');
  const json = JSON.stringify(data);

  return new Response(json,
    {
      headers: {
        "content-type": "application/json"
      }
    });
};

export default paymentAuth;