const authToken = btoa(`${YAPILY_KEY}:${YAPILY_SECRET}`);

// used for testing
const yapily = async (request: Request): Promise<Response> => {
  const newRequest = new Request(request);
  const url = new URL(request.url);
  const path = url.pathname.split('/')[2];
  url.hostname = 'api.yapily.com'
  url.pathname = `/${path}`;
  newRequest.headers.append('Authorization', `Basic ${authToken}`);
  console.log('hey there');
  return fetch(url.toString(), newRequest);
}

export default yapily;