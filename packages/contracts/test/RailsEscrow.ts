import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { RailsEscrow } from "../typechain";
import { Signers } from "../types";
import { shouldAddAndRemoveAssets, shouldAddAndRemoveSellers } from "./RailsEscrow.behavior";


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
      this.escrow = <RailsEscrow>await deployContract(this.signers.admin, railsEscrowArtifact);
      
    });
  });
});