// import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
// import { prepare } from "./handlers/prepare";
// import { fulfil } from "./handlers/fulfil";
import accountAuth from "./handlers/accountAuth";
import yapily from './handlers/yapily';

function cors(url: URL, response: Response) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.append("Access-Control-Allow-Origin", '*');
  newResponse.headers.append("Vary", "Origin");
  newResponse.headers.append("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  return newResponse;
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  switch(url.pathname.split('/')[1]) {
    // case '/institutions':
    //   return institutionsHandler(request);
    case 'accounts':
      return cors(url, await getAccounts(request));
    case 'account-auth':
      return cors(url, await accountAuth(request));
    case 'yapily':
      return cors(url, await yapily(request));
    // case '/prepare':
    //   return prepare(request);
    // case '/fulfil':
    //   return fulfil(request)
    // case '/cancel':
    //   console.log('cancel swap');
    //   break;
    default:
      break;
  }

  return new Response(`request method: ${request.method}`, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  })

}
