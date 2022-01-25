import authCall from "../utils/authCall";
import { getReference } from "./createPaymentAuth";

export const checkTransaction = async (consentToken: string, accountId: string, swapHash: string, expectedAmount: number): Promise<boolean> => {
  const url = `https://api.yapily.com/accounts/${accountId}/transactions`;
  console.log(consentToken);
  const response = await authCall(url, undefined, 'GET', consentToken);
  console.log(response);
  const txs = response.data;
  console.log(txs);
  if (!txs) {
    return false;
  }
  
  const ref = getReference(swapHash);
  const found = txs.find((tx: any) => tx.description === ref);
  console.log(found);
  if(!found) return false;
  
  const { amount } = found.transactionAmount;
  if(amount != expectedAmount) return false;
  
  return true;
}