import { ethers } from "ethers";

const provider = ethers.getDefaultProvider("ropsten");
const wallet = ethers.Wallet.fromMnemonic(process.env.mnemonic as string).connect(provider);

export const createSignature = async(digest: string): Promise<string> => {
  const signature = await wallet.signMessage(digest);
  return signature;
}