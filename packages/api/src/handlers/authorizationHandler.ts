import authCall from "../utils/authCall";

const authorizationHandler = async (request: Request): Promise<Response> => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const { applicationUserId, institutionId } = request.body;

  const body = {
    applicationUserId,
    institutionId,
    callback: "https://display-parameters.com/"
  }

  const data = await authCall('https://api.yapily.com/account-auth-requests', body, 'POST');
  const json = JSON.stringify(data);

  return new Response(json,
    {
      headers: {
        "content-type": "application/json"
      }
    });
};

export default authorizationHandler;