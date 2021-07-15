const institutionsHandler = async (request: Request): Promise<void | Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    })
  }
}

export default institutionsHandler;