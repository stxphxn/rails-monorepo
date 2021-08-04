import { ethers } from "ethers";

const provider = ethers.getDefaultProvider('rinkeby');
export const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC as string).connect(provider);