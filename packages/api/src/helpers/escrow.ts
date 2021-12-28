import { RailsEscrow__factory } from '@rails/contracts/src/types';
import { ethers } from 'ethers'

const provider = ethers.getDefaultProvider('http://localhost:8545');
export const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);
export const escrow = RailsEscrow__factory.connect(RAILS_ESCROW_ADDRESS, wallet);
