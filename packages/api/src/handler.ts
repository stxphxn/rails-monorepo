import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
import { prepareSwap } from "./handlers/prepareSwap";

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    case '/institutions':
      return institutionsHandler(request);
    case '/accounts':
      return getAccounts(request);
    case '/prepare-swap':
      return prepareSwap(request);
    case '/fulfill-swap':
      console.log('release funds if payment has been made');
      break;
    default:
      break;
  }

  return new Response(`request method: ${request.method}`)

}
