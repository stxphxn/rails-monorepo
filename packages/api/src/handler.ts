// import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
// import { prepare } from "./handlers/prepare";
// import { fulfil } from "./handlers/fulfil";
import accountAuth from "./handlers/accountAuth";
import yapily from './handlers/yapily';
import { addAccount } from "./handlers/addAccount";

function cors(response: Response) {
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
      return cors(await getAccounts(request));
    case 'account-auth':
      return cors(await accountAuth(request));
    case 'yapily':
      return cors(await yapily(request));
    case 'add-account':
      return cors(await addAccount(request));
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
