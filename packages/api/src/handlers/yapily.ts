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

// used for testing
const yapily = async (request: Request): Promise<Response> => {
  const url = changeUrl(request.url)
  try {
    const response = await fetch(url, createRequest(request));
    return response
  } catch(e: any) {
    console.log(e);
    return new Response(e.message)
  }

}

export default yapily;