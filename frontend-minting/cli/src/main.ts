#!/usr/bin/env node
import { program } from "commander";
import { ethers } from "ethers";
import { buildDependencyContainer } from "./di/buildDependencyContainer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("custom-env").env();

(async () => {
  const dependencyContainer = await buildDependencyContainer();
  const {
    ethersProvider,
  } = dependencyContainer.cradle;

  program
    .command("mint")
    .description("Mints a new NFT")
    .option("-a, --address <address>", "Address of the new owner")
    .action(async (options) => {
      const nftAddress = process.env.CONTRACT_ADDRESS as string;
      const minterPrivateKey = process.env.MINTER_PRIVATE_KEY as string;
      const nftAbi: string[] = [
        "function mintTo(address _to) public"
      ];

      let signer = new ethers.Wallet(minterPrivateKey);

      console.log(`Minting to ${options.address}, Minter: ${signer.address}`);
      
      signer = signer.connect(ethersProvider);

      const contract = new ethers.Contract(nftAddress, nftAbi, signer);

      await contract.mintTo(options.address);
    });

  program.parse(process.argv);
})();
