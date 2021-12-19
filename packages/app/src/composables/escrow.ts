/* eslint-disable camelcase */
import { ethers, Wallet } from 'ethers';
import { RailsEscrow__factory, RevertableERC20__factory } from '@rails/contracts/src/types';
import { SwapDataStruct, SwapInfoStruct } from '@rails/contracts/src/types/IRailsEscrow';

const provider = new ethers.providers.JsonRpcProvider();
const escrowAddress = process.env.VUE_APP_ESCROW_ADDRESS as string;
const daiAddress = process.env.VUE_APP_DAI_ADDRESS as string;

function getEscrow(signer?: Wallet) {
  return RailsEscrow__factory.connect(escrowAddress, signer || provider);
}

function getDaiContract(signer?: Wallet) {
  return RevertableERC20__factory.connect(daiAddress, signer || provider);
}

export const useGetLiquidity = async (sellers: string[]): Promise<ethers.BigNumber[]> => {
  const escrow = getEscrow();
  const promises = sellers.map((seller) => escrow.sellerBalances(seller, daiAddress));
  const balances = await Promise.all(promises);
  return balances;
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
