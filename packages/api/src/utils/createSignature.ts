import { wallet } from "../helpers/getWallet";

export const createSignature = async(digest: string): Promise<string> => {
  const signature = await wallet.signMessage(digest);
  return signature;
}