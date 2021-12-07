import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber } from "ethers";

import { RailsEscrow, RevertableERC20 } from "../src/types";
import { Signers } from "./types";
import { 
  shouldAddAndRemoveAssets,
  shouldAddAndRemoveSellers,
  shouldAddAndRemoveLiqudity,
  shouldPrepare,
  shouldFulfil,
  getSwapData,
  shouldCancel
} from "./RailsEscrow.behavior";


const { deployContract } = hre.waffle;

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.seller = signers[1];
    this.signers.buyer = signers[2];
    this.signers.oracle = signers[3];
  });

  describe('RailsEscrow', function () {
    beforeEach(async function () {
      const railsEscrowArtifact: Artifact = await hre.artifacts.readArtifact("RailsEscrow");
      this.escrow = <RailsEscrow>await deployContract(this.signers.admin, railsEscrowArtifact);
    });

    shouldAddAndRemoveAssets();
    shouldAddAndRemoveSellers();
  });

  describe('RailsEscrow: Add and Remove Liquidity', function () {
    beforeEach(async function () {
      const railsEscrowArtifact: Artifact = await hre.artifacts.readArtifact("RailsEscrow");
      const erc20Artifact: Artifact = await hre.artifacts.readArtifact("RevertableERC20");

      this.escrow = <RailsEscrow>await deployContract(this.signers.seller, railsEscrowArtifact);
      this.erc20 = <RevertableERC20>await deployContract(this.signers.seller, erc20Artifact);

      await this.escrow.addAssetId(this.erc20.address);
      await this.escrow.addSeller(this.signers.seller.address);
    });

    shouldAddAndRemoveLiqudity();
  });

  describe('RailsEscrow: Prepare', function () {
    beforeEach(async function () {
      const railsEscrowArtifact: Artifact = await hre.artifacts.readArtifact("RailsEscrow");
      const erc20Artifact: Artifact = await hre.artifacts.readArtifact("RevertableERC20");

      this.escrow = <RailsEscrow>await deployContract(this.signers.seller, railsEscrowArtifact);
      this.erc20 = <RevertableERC20>await deployContract(this.signers.seller, erc20Artifact);

      await this.escrow.addAssetId(this.erc20.address);
      await this.escrow.addSeller(this.signers.seller.address);

      const amount = BigNumber.from('10');
      await this.erc20.approve(this.escrow.address, amount);
      await this.escrow.addLiquidity(amount, this.erc20.address);
    });

    shouldPrepare();
  });


  describe('RailsEscrow: Fulfil and Cancel', function () {
    beforeEach(async function () {
      const railsEscrowArtifact: Artifact = await hre.artifacts.readArtifact("RailsEscrow");
      const erc20Artifact: Artifact = await hre.artifacts.readArtifact("RevertableERC20");

      this.escrow = <RailsEscrow>await deployContract(this.signers.seller, railsEscrowArtifact);
      this.erc20 = <RevertableERC20>await deployContract(this.signers.seller, erc20Artifact);

      await this.escrow.addAssetId(this.erc20.address);
      await this.escrow.addSeller(this.signers.seller.address);

      const amount = BigNumber.from('10');
      await this.erc20.approve(this.escrow.address, amount);
      await this.escrow.addLiquidity(amount, this.erc20.address);

      const swapInfo = {
        buyer: this.signers.buyer.address,
        seller: this.signers.seller.address,
        oracle: this.signers.oracle.address,
        assetId: this.erc20.address,
        amount: BigNumber.from('5'),
        swapId: 1,
        currencyHash: '0x498085903',
      }
      this.buyerEscrow = await this.escrow.connect(this.signers.buyer);
      const prepareTx = await this.buyerEscrow.prepare(swapInfo);
      this.swapReceipt = await prepareTx.wait();
    });

    shouldFulfil();
    shouldCancel();
  });
});