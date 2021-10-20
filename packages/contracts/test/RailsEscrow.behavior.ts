import { expect } from "chai";

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

  it("should not add an already exisiting asset", async function () {
    await this.escrow.addSeller(this.signers.seller.address)
    await expect(this.escrow.addSeller(this.signers.seller.address)).to.be.reverted;
  });
}


export function shouldAddAndRemoveLiqudity(): void {
  it('should add liquidity', async function () {
    this.escrow.addSeller(this.signers.seller.address)
    const seller = await this.escrow.connect(this.signers.seller);
  });
}

