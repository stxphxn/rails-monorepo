import { RailsEscrow__factory } from '@rails/contracts/src/types';
import { getDefaultProvider, Wallet } from 'ethers'

const provider = getDefaultProvider('http://127.0.0.1:8545/');
export const wallet = Wallet.fromMnemonic(MNEMONIC).connect(provider);
export const escrow = RailsEscrow__factory.connect(RAILS_ESCROW_ADDRESS, wallet);


