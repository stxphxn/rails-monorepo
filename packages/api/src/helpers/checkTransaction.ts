import authCall from "../utils/authCall";
import { getReference } from "./createPaymentAuth";

export const checkTransaction = async (consentToken: string, accountId: string, swapHash: string, expectedAmount: number): Promise<boolean> => {
  const ref = getReference(swapHash);
  const url = `https://api.yapily.com/${accountId}/transactions`;
  const response = await authCall(url, undefined, 'GET', consentToken);
  const txs = response.data;
  const found = txs.find((tx: any) => tx.reference === ref);
  if(!found) return false;
  const { amount } = found.transactionAmount;
  if(amount !== expectedAmount) return false;
  return true;
}