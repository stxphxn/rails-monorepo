import institutionsHandler from "./handlers/institutionsHandler";

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    case '/institutions':
      console.log('get institutions');
      return institutionsHandler(request);
    default:
      break;
  }

  return new Response(`request method: ${request.method}`)

}
