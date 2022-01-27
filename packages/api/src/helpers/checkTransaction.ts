import authCall from "../utils/authCall";
import { getReference } from "./createPaymentAuth";

export const checkTransaction = async (consentToken: string, accountId: string, swapHash: string, expectedAmount: number): Promise<boolean> => {
  const url = `https://api.yapily.com/accounts/${accountId}/transactions`;
  const response = await authCall(url, undefined, 'GET', consentToken);
  const txs = response.data;
  if (!txs) {
    return false;
  }
  
  const ref = getReference(swapHash);
  const found = txs.find((tx: any) => tx.description === ref);
  if(!found) return false;
  
  const { amount } = found.transactionAmount;
  if(amount != expectedAmount) return false;
  console.log(`FOUND PAYMENT ID: ${ref}`);

  return true;
}