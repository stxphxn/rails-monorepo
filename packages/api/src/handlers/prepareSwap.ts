import {fetchAccountDetails} from '../helpers/fetchAccountDetails';

type SwapDetails = {
  buyer: string,
  seller: string,
  currency: string,
  token: string,
  exchangeRate: string,
  amount: number,
  expiry: number,
}

type PrepareSwapRequestBody = {
  swapDetails: SwapDetails,
  sellerInstitution: string,
  buyerInstititution: string,
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
  // TODO: fetch seller account details
  const accountDetails = await fetchAccountDetails(swapDetails.seller, body.sellerInstitution);

  // TODO: create payment autorization
  // TODO: create oracle signature 

  return new Response('result',
    {
      headers: {
        "content-type": "application/json"
      }
    });
};