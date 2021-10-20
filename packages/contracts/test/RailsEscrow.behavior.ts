import { BigNumber, ContractReceipt, Signer, Wallet } from "ethers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { defaultAbiCoder, randomBytes, solidityKeccak256, arrayify, splitSignature, Bytes } from "ethers/lib/utils";

chai.use(solidity);

export function shouldAddAndRemoveAssets(): void {
  const asset = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  it("should add a asset", async function () {
    await expect(this.escrow.addAssetId(asset))
    .to.emit(this.escrow, 'AssetAdded')
    .withArgs(asset, this.signers.admin.address);
  });

  it("should remove asset", async function () {
    await this.escrow.addAssetId(asset);
    await expect(this.escrow.removeAssetId(asset))
    .to.emit(this.escrow, 'AssetRemoved')
    .withArgs(asset, this.signers.admin.address);
  });

  it("should only be called by the owner", async function () {
    const notOwner = await this.escrow.connect(this.signers.seller);
    await expect(notOwner.addAssetId(asset)).to.be.reverted;
    await expect(notOwner.removeAssetId(asset)).to.be.reverted;
  });

  it("should not add an already exisiting asset", async function () {
    await this.escrow.addAssetId(asset)
    await expect(this.escrow.addAssetId(asset)).to.be.reverted;
  });
}

export function shouldAddAndRemoveSellers(): void {
  it("should add a seller", async function () {
    await expect(this.escrow.addSeller(this.signers.seller.address))
    .to.emit(this.escrow, 'SellerAdded')
    .withArgs(this.signers.seller.address, this.signers.admin.address);
  });

  it("should remove a seller", async function () {
    await this.escrow.addSeller(this.signers.seller.address);
    await expect(this.escrow.removeSeller(this.signers.seller.address))
    .to.emit(this.escrow, 'SellerRemoved')
    .withArgs(this.signers.seller.address, this.signers.admin.address);
  });

  it("should only be called by the owner", async function () {
    const notOwner = await this.escrow.connect(this.signers.seller);
    await expect(notOwner.addSeller(this.signers.seller.address)).to.be.reverted;
    await expect(notOwner.removeSeller(this.signers.seller.address)).to.be.reverted;
  });

  it("should not add an already exisiting seller", async function () {
    await this.escrow.addSeller(this.signers.seller.address)
    await expect(this.escrow.addSeller(this.signers.seller.address)).to.be.reverted;
  });
}


export function shouldAddAndRemoveLiqudity(): void {
  it('should add liquidity', async function () {
    const amount = BigNumber.from('10');

    await this.erc20.approve(this.escrow.address, amount);
    await expect(this.escrow.addLiquidity(amount, this.erc20.address))
    .to.emit(this.escrow, 'LiquidityAdded');
    const balance = await this.erc20.balanceOf(this.signers.seller.address);
    expect(balance).to.equal(BigNumber.from('999999999999999999999990'));
  });

  it('should remove liquidity', async function () {
    const amount = BigNumber.from('10');

    await this.erc20.approve(this.escrow.address, amount);
    await this.escrow.addLiquidity(amount, this.erc20.address);

    await expect(this.escrow.removeLiquidity(amount, this.erc20.address))
    .to.emit(this.escrow, 'LiquidityRemoved');
    const balance = await this.erc20.balanceOf(this.signers.seller.address);
    expect(balance).to.equal(BigNumber.from('1000000000000000000000000'));
  });
}

export function shouldPrepare(): void {
  it('should prepare as swap', async function () {
    const swapInfo = {
      buyer: this.signers.buyer.address,
      seller: this.signers.seller.address,
      oracle: this.signers.oracle.address,
      assetId: this.erc20.address,
      amount: BigNumber.from('5'),
      swapId: 1,
      currencyHash: '0x498085903',
    }
    const buyerEscrow = await this.escrow.connect(this.signers.buyer);

    await expect(buyerEscrow.prepare(swapInfo))
    .to.emit(buyerEscrow, 'SwapPrepared');
    
    const sellerLiquidity = await this.escrow.sellerBalances(this.signers.seller.address, this.erc20.address);
    await expect(sellerLiquidity).to.equal(BigNumber.from('5'));
  });
}

export const getSwapData = async (receipt: ContractReceipt, eventName: string) => {
  const idx = receipt.events?.findIndex((e) => e.event === eventName) ?? -1;
  const decoded = receipt.events![idx].decode!(receipt.events![idx].data, receipt.events![idx].topics);
  return {
    swapHash: decoded[0],
    swapData: {
      buyer: decoded[1][0],
      seller: decoded[1][1],
      oracle: decoded[1][2],
      assetId: decoded[1][3],
      amount: decoded[1][4],
      swapId: decoded[1][5],
      currencyHash: decoded[1][6],
      prepareBlockNumber: decoded[1][7],
      expiry: decoded[1][8],
   }
}
};

export const tidy = (str: string): string => `${str.replace(/\n/g, "").replace(/ +/g, " ")}`;

export const SignedFulfillDataEncoding = tidy(`tuple(
  string functionIdentifier,
  bytes32 swapHash
)`);

export const encodeSignatureData = (type: string, swapHash: Bytes): string => {
  return defaultAbiCoder.encode(
    [SignedFulfillDataEncoding],
    [{ functionIdentifier: type, swapHash: swapHash}],
  );
};

const sanitizeSignature = (sig: string): string => {
  if (sig.endsWith("1c") || sig.endsWith("1b")) {
    return sig;
  }

  // Must be sanitized
  const { v } = splitSignature(sig);
  const hex = BigNumber.from(v).toHexString();
  return sig.slice(0, sig.length - 2) + hex.slice(2);
};

const sign = async (hash: string, signer: Wallet | Signer): Promise<string> => {
  const msg = arrayify(hash);
  return sanitizeSignature(await signer.signMessage(msg));
};

export function shouldFulfil(): void {
  it('should let the seller fulfil the swap', async function () {
    const swapData = await getSwapData(this.swapReceipt, 'SwapPrepared');
    await expect(this.escrow.fulfil(swapData.swapData, randomBytes(32)))
    .to.emit(this.escrow, 'SwapFulfiled');

    const tokens = await this.erc20.balanceOf(this.signers.buyer.address);
    await expect(tokens).to.equal(BigNumber.from('5'));
  });

  it('should let the buyer fulfil with a signature from the oracle', async function () {
    const swapData = await getSwapData(this.swapReceipt, 'SwapPrepared');

    const payload = encodeSignatureData('fulfil', swapData.swapHash);
    const hash = solidityKeccak256(['bytes'], [payload]);
    const signature = await sign(hash, this.signers.oracle);

    await expect(this.buyerEscrow.fulfil(swapData.swapData, signature))
    .to.emit(this.escrow, 'SwapFulfiled');

    const tokens = await this.erc20.balanceOf(this.signers.buyer.address);
    await expect(tokens).to.equal(BigNumber.from('5'));
  });
}

export function shouldCancel(): void {
  it('should let the buyer cancel the swap', async function () {
    const swapData = await getSwapData(this.swapReceipt, 'SwapPrepared');
    await expect(this.buyerEscrow.cancel(swapData.swapData, randomBytes(32)))
    .to.emit(this.escrow, 'SwapCancelled');

    const sellerLiquidity = await this.escrow.sellerBalances(this.signers.seller.address, this.erc20.address);
    await expect(sellerLiquidity).to.equal(BigNumber.from('10'));
  });

  it('should let the swap be cancelled with a signature', async function () {
    const swapData = await getSwapData(this.swapReceipt, 'SwapPrepared');

    const payload = encodeSignatureData('cancel', swapData.swapHash);
    const hash = solidityKeccak256(['bytes'], [payload]);
    const signature = await sign(hash, this.signers.oracle);

    await expect(this.buyerEscrow.cancel(swapData.swapData, signature))
    .to.emit(this.escrow, 'SwapCancelled');

    const sellerLiquidity = await this.escrow.sellerBalances(this.signers.seller.address, this.erc20.address);
    await expect(sellerLiquidity).to.equal(BigNumber.from('10'));
  });
}

