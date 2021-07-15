const institutionsHandler = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    })
  }

  return new Response(`request method: ${request.method}`)
}

export default institutionsHandler;