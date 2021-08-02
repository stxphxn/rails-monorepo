

export const prepareSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }
  
  console.log('TODO: check signature against swap details');
  console.log('TODO: ')
  const body = await request.json();

  return new Response('result',
    {
      headers: {
        "content-type": "application/json"
      }
    });
};