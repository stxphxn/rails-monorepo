import { handleRequest } from './handler'


function handleOptions(request: Request) {
  const headers = request.headers
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
) {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || ''  ,
      }
    })
}
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": '*',
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  
}

addEventListener('fetch', (event) => {
  if (event.request.method === "OPTIONS") {
    // Handle CORS preflight requests
    event.respondWith(handleOptions(event.request));
  } else {
    event.respondWith(handleRequest(event.request).catch(err => {
      const message = err.reason || err.stack || 'Unknown Error'

      return new Response(message, {
        status: err.status || 500,
        statusText: err.statusText || null,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          // Disables caching by default.
          'Cache-Control': 'no-store',
          // Returns the "Content-Length" header for HTTP HEAD requests.
          'Content-Length': message.length,
        }
    });
  }));
  }
});

