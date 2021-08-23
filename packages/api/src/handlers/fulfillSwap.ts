
export type fulfillSwapRequestBody = {
  
}

export const fulfillSwap = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }


  return new Response('response',
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};
