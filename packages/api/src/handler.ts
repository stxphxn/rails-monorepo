import { prepare } from "./handlers/prepare";
import { fulfil } from "./handlers/fulfil";
import { ob } from './handlers/ob';
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
    case 'ob':
      return cors(await ob(request));
    case 'add-account':
      return cors(await addAccount(request));
    case 'prepare':
      return cors(await prepare(request));
    case 'fulfil':
      return cors(await fulfil(request));

    default:
      break;
  }

  return new Response(`request method: ${request.method}`, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  })

}
