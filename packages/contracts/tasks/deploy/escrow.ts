import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { RailsEscrow, RevertableERC20 } from "../../src/types/";
import { RailsEscrow__factory, RevertableERC20__factory } from "../../src/types/";

task("deploy:RailsEscrow")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const escrowFactory:  RailsEscrow__factory = <RailsEscrow__factory>await ethers.getContractFactory("RailsEscrow");
    const escrow: RailsEscrow = <RailsEscrow>await escrowFactory.deploy();
    await escrow.deployed();
    console.log("Escrow deployed to: ", escrow.address);

    const ERC20Factory: RevertableERC20__factory = <RevertableERC20__factory>await ethers.getContractFactory('RevertableERC20');
    const ERC20: RevertableERC20 = <RevertableERC20>await ERC20Factory.deploy();
    await ERC20.deployed();
    console.log('ERC20 deployed to: ', ERC20.address);

    await escrow.addAssetId(ERC20.address);

  });

  

