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
  // get Request body
  const body: AddAccountReqBody = await request.json();
  try {
    // check consent token returns an account
    const accountInfo = await authCall('https://api.yapily.com/accounts', undefined, 'GET', body.consent)
    .catch((e) => {throw e})
    // Call escrow contract to add seller
    const tx = await escrow.addSeller(body.account);
    // store in db
    await SELLERS_DB.put(body.account, JSON.stringify({
      institutionId: body.institutionId,
      consent: body.consent,
      accountInfo,
    }))
    // return transaction details
    return new Response(JSON.stringify(tx),
    {
      headers: {
        "content-type": 'application/json'
      }
    });
  } catch(e: any) {
    return new Response(e.message)
  }
};