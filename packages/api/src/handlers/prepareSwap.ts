type SwapDetails = {
  buyer: string,
  seller: string,
  currency: string,
  token: string,
  exchangeRate: string,
}


export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  const body = await request.json();

  const swapDetails: SwapDetails = body.swapDetails;

  console.log('TODO: check signature against swap details');
  console.log('TODO: fetch seller consent token');
  console.log('TODO: create payment autorization');
  console.log('TODO: create oracle signature ');

  return new Response('result',
    {
      headers: {
        "content-type": "application/json"
      }
    });
};