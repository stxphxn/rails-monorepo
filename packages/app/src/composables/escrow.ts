/* eslint-disable camelcase */
import { ethers, Wallet } from 'ethers';
import { RailsEscrow__factory, RevertableERC20__factory } from '@rails/contracts/src/types';
import { SwapDataStruct, SwapInfoStruct } from '@rails/contracts/src/types/IRailsEscrow';
import { id } from 'ethers/lib/utils';

const provider = ethers.getDefaultProvider('http://127.0.0.1:8545/');
const escrowAddress = process.env.VUE_APP_ESCROW_ADDRESS as string;
const daiAddress = process.env.VUE_APP_DAI_ADDRESS as string;

function getEscrow(signer?: Wallet) {
  return RailsEscrow__factory.connect(escrowAddress, signer || provider);
}

function getDaiContract(signer?: Wallet) {
  return RevertableERC20__factory.connect(daiAddress, signer || provider);
}

export const getSellers = async (): Promise<string[]> => {
  const escrow = getEscrow();
  const filter = {
    address: escrowAddress,
    fromBlock: 0,
    topics: [id('SellerAdded(address,address)'),
    ],
  };
  const events = await escrow.queryFilter(filter, 0);
  return events.map((e) => e.args[0]);
};

export const useGetLiquidity = async (sellers: string[]): Promise<any> => {
  const escrow = getEscrow();
  const promises = sellers.map((seller) => escrow.sellerBalances(seller, daiAddress));
  const results = await Promise.all(promises);
  const balances = sellers.map((s, i) => ({ seller: s, balance: results[i] }));
  return {
    balances,
    totalLiquidity: results.reduce((a, b) => a + b.toNumber(), 0),
    largestSwap: Math.max(...results.map((r) => r.toNumber())),
  };
};

export const useAddLiquidity = async (
  amount: number,
  assetId: string,
  signer: Wallet,
): Promise<ethers.ContractTransaction> => {
  const escrow = getEscrow(signer);
  const dai = getDaiContract(signer);
  await dai.approve(escrowAddress, amount);
  return escrow.addLiquidity(amount, assetId);
};

export const useRemoveLiquidity = async (
  amount: number,
  assetId: string,
  signer: Wallet,
): Promise<ethers.ContractTransaction> => {
  const escrow = getEscrow(signer);
  return escrow.removeLiquidity(amount, assetId);
};

export const usePrepare = async (
  swapInfo: SwapInfoStruct,
  signature: ethers.BytesLike,
  signer: Wallet,

): Promise<ethers.ContractTransaction> => {
  const escrow = getEscrow(signer);
  return escrow.prepare(swapInfo, signature);
};

export const useFulfil = async (
  swapData: SwapDataStruct,
  signature: ethers.BytesLike,
  signer: Wallet,

): Promise<ethers.ContractTransaction> => {
  const escrow = getEscrow(signer);
  return escrow.fulfil(swapData, signature);
};

export const useCancel = async (
  swapData: SwapDataStruct,
  signature: ethers.BytesLike,
  signer: Wallet,

): Promise<ethers.ContractTransaction> => {
  const escrow = getEscrow(signer);
  return escrow.cancel(swapData, signature);
};
