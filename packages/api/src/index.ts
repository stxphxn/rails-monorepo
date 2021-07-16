import { handleRequest } from './handler'

addEventListener('fetch', (event) => {
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
});

