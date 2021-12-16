// import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
// import { prepare } from "./handlers/prepare";
// import { fulfil } from "./handlers/fulfil";
import accountAuth from "./handlers/accountAuth";
import yapily from './handlers/yapily';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    // case '/institutions':
    //   return institutionsHandler(request);
    case '/accounts':
      return getAccounts(request);
    case '/account-auth':
      return accountAuth(request);
    case '/yapily':
      return yapily(request);
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

  return new Response(`request method: ${request.method}`)

}
