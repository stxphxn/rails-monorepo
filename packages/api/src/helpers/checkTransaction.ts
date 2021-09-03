import authCall from "../utils/authCall";
import { getReference } from "./createPaymentAuth";

export const checkTransaction = async (consentToken: string, accountId: string, swapHash: string, expectedAmount: number): Promise<boolean> => {
  const url = `https://api.yapily.com/${accountId}/transactions`;
  const txs = (await authCall(url, undefined, 'GET', consentToken)).data;
  
  const ref = getReference(swapHash);
  const found = txs.find((tx: any) => tx.reference === ref);
  
  if(!found) return false;
  
  const { amount } = found.transactionAmount;
  if(amount !== expectedAmount) return false;
  
  return true;
}