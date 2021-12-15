import { RailsEscrow__factory } from '@rails/contracts/src/types';
import { utils, ethers } from 'ethers'

const provider = ethers.getDefaultProvider('rinkeby');
export const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);
const escrow = RailsEscrow__factory.connect(RAILS_ESCROW_ADDRESS, wallet);