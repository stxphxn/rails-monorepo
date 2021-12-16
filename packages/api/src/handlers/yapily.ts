const authToken = btoa(`${YAPILY_KEY}:${YAPILY_SECRET}`);

// used for testing
const yapily = async (request: Request): Promise<Response> => {
  const newRequest = new Request(request);
  newRequest.headers.append('Authorization', `Basic ${authToken}`);
  return fetch(newRequest);
}

export default yapily;