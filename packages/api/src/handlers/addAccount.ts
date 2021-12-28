import authCall from "../utils/authCall";
import { escrow } from '../helpers/escrow';

type AddAccountReqBody = {
  account: string,
  consent: string,
  institutionId: string,
}

export const addAccount = async(request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response("Method Not Allowed", {
      status: 405
    });
  } 

  const body: AddAccountReqBody = await request.json();
  // check consent token
  const accountInfo = await authCall('https://api.yapily.com/accounts', undefined, 'GET', body.consent)
  .catch((e) => {throw e})

  // addSeller tx
  const tx = await escrow.addSeller(body.account);
  // store in db
  await SELLERS_DB.put(body.account, JSON.stringify({
    consent: body.consent,
    accountInfo,
  }))
  
  return new Response(JSON.stringify(tx),
  {
    headers: {
      "content-type": 'application/json'
    }
  });
};