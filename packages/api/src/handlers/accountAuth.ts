import authCall from "../utils/authCall";

const accountAuth = async (request: Request): Promise<Response> => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405
    });
  }

  const body = await request.json();

  const reqBody = {
    applicationUserId: body.applicationUserId,
    institutionId: body.institutionId,
    callback: "https://display-parameters.com/"
  }

  const data = await authCall('https://api.yapily.com/account-auth-requests', reqBody, 'POST');
  const json = JSON.stringify(data);

  return new Response(json,
    {
      headers: {
        "content-type": "application/json"
      }
    });
};

export default accountAuth;