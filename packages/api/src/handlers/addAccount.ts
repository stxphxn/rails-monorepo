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
    const response = await authCall('https://api.yapily.com/accounts', undefined, 'GET', body.consent)
    .catch((e) => {throw e});

    const accountInfo = response.data[0];
    console.log(`FETCHED ACCOUNT DETAILS FROM OPEN BANKING API`);

    
    // Call escrow contract to add seller
    console.log(`ADD SELLER TO ESCROW CONTRACT`)
    const tx = await escrow.addSeller(body.account);
    const receipt = await tx.wait();
    console.log(`SELLER ${body.account} ADDED TO ESCROW CONTRACT`);

    // store in db
    await SELLERS_DB.put(body.account, JSON.stringify({
      institutionId: body.institutionId,
      consent: body.consent,
      accountInfo,
    }))
    console.log(`SELLER ${body.account} ADDED TO SELLERS DB`);


    const res = {
      message: `Seller ${body.account} Added`,
      transactionHash: receipt.transactionHash,
    }
    // return transaction details
    return new Response(JSON.stringify(res),
    {
      headers: {
        "content-type": 'application/json'
      }
    });
  } catch(e: any) {
    return new Response(e.message)
  }
};