import { ethers } from "ethers";

const provider = ethers.getDefaultProvider('rinkeby');
export const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);