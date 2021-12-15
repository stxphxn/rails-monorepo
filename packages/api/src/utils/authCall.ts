const authToken = btoa(`${YAPILY_KEY}:${YAPILY_SECRET}`);

type AuthRequest = {
  method: string,
  headers: {
    'Authorization': string,
    'Content-Type': string,
    'consent'?: string,
  },
  body?: string,
}

const authCall = async (url: string, data = {}, method = 'GET', consentToken?: string): Promise<any> => {
  const request: AuthRequest = {
    method: method,
    headers: {
      'Authorization': `Basic ${authToken}`,
      'Content-Type': 'application/json'
    },
  };

  if (method !== 'GET') {
    request.body = JSON.stringify(data);
  }

  if (consentToken) {
    request.headers['consent'] = consentToken;
  }
  console.log(request);
  return (await fetch(url, request)).json();
}

export default authCall;
