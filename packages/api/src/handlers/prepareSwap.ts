import {fetchConsentToken} from '../helpers/fetchConsentToken';

type SwapDetails = {
  buyer: string,
  seller: string,
  currency: string,
  token: string,
  exchangeRate: string,
  amount: number,
  expiry: number,
}


export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body = await request.json();
  const swapDetails: SwapDetails = body.swapDetails;
  // TODO: check signature against swap details
  // TODO: fetch seller account details
    const consentToken = await fetchConsentToken(swapDetails.seller, '1');
  // TODO: create payment autorization
  // TODO: create oracle signature 

  return new Response('result',
    {
      headers: {
        "content-type": "application/json"
      }
    });
};