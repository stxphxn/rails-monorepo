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

    const amount = ethers.utils.parseEther('1000');
    // Mint test tokens to Alice
    const tx = {
      from: '0xc9adffdf9e929399825c648bd3250fc8016450d7',
      to: '0xE39C00bF56C1b8818fB90c5C8449d71d40eDdbE6',
      value: ethers.utils.parseEther('1'),
      nonce: ethers.provider.getTransactionCount('0xc9adffdf9e929399825c648bd3250fc8016450d7', "latest"),
      gasLimit: ethers.utils.hexlify(21000),
      gasPrice: ethers.provider.getGasPrice(),
    };

    const signer = ethers.provider.getSigner();
    await signer.sendTransaction(tx);
    console.log('1 Test Ether Sent');


    await ERC20.mint('0xE39C00bF56C1b8818fB90c5C8449d71d40eDdbE6', amount);
    console.log('1000 Test ERC20 sent')

  });

  