import authCall from "../utils/authCall";

const getInstitutions = async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const data = await authCall('https://api.yapily.com/institutions');
  const json = JSON.stringify(data);

  return new Response(json,
    {
      headers: {
        "content-type": "application/json"
      }
    });
};

export default getInstitutions;