import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
import { prepare } from "./handlers/prepare";

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    case '/institutions':
      return institutionsHandler(request);
    case '/accounts':
      return getAccounts(request);
    case '/prepare':
      return prepare(request);
    case '/fulfil':
      console.log('release funds if payment has been made');
      break;
    case '/cancel':
      console.log('cancel swap');
      break;
    default:
      break;
  }

  return new Response(`request method: ${request.method}`)

}
