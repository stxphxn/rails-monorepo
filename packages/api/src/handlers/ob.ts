const authToken = btoa(`${YAPILY_KEY}:${YAPILY_SECRET}`);


type YapilyRequest = {
  method: string,
  headers: {
    'Authorization': string,
    'Content-Type': string,
    'Consent'?: string,
  },
  body?: ReadableStream<Uint8Array> | null,
}
const ALLOWED_CALLS = ['']

function createRequest(r: Request) {
  const request: YapilyRequest = {
    method: r.method,
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: r.body,
  };

  const consent = r.headers.has('Consent');
  if (consent) {
    request.headers.Consent = r.headers.get('Consent') || '' ;
  }
  return request;
}

function changeUrl(u: string) {
  const url = new URL(u);
  const path = url.pathname.split('/')[2];
  url.hostname = 'api.yapily.com'
  url.pathname = `/${path}`;
  return url.toString();
}

export const ob = async (request: Request): Promise<Response> => {
  try {
    // checks if request is allowed and
    // changes request URL to OB API
    const url = changeUrl(request.url)
    // Create a new Request containing Auth Token
    const response = await fetch(url, createRequest(request));
    return response
  } catch(e: any) {
    return new Response(e.message)
  }
}

export default ob;