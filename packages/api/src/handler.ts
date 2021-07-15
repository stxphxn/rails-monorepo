export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  switch(url.pathname) {
    case '/institutions':
      console.log('get institutions');
      return new Response(`request method: ${request.method}`)
    default:
      break;
  }

  return new Response(`request method: ${request.method}`)

}
