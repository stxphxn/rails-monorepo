import institutionsHandler from "./handlers/getInstitutions";
import getAccounts from "./handlers/getAccounts";
import accountAuth from "./handlers/accountAuth";

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    case '/institutions':
      return institutionsHandler(request);
    case '/account-auth-request':
      return accountAuth(request);
    case '/accounts':
      return getAccounts(request);
    case '/prepare-swap':
      console.log('create a new trade');
      break;
    case '/fulfill-swap':
      console.log('release funds if payment has been made');
      break;
    default:
      break;
  }

  return new Response(`request method: ${request.method}`)

}
