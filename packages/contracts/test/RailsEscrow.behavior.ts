import { BigNumber } from "ethers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";

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

