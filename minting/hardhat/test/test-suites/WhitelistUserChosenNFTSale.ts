import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  TestNFT,
  TestNFT__factory,
  WhitelistUserChosenNFTSale,
  WhitelistUserChosenNFTSale__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { keccak256, solidityKeccak256 } from "ethers/lib/utils";

import { MerkleTree } from "merkletreejs";

describe("Whitelist User Chosen NFT Sale", () => {
  let testNFT: TestNFT;
  let saleContract: WhitelistUserChosenNFTSale;
  let owner: Signer;
  let randomAcc: Signer;

  before(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    randomAcc = signers[1];
  });

  beforeEach(async () => {
    const deploys = await deployments.fixture(["all"]);

    const provider = ethers.getDefaultProvider();

    testNFT = TestNFT__factory.connect(
      deploys["TestNFT"].address,
      provider
    );

    testNFT = testNFT.connect(owner);

    saleContract = WhitelistUserChosenNFTSale__factory.connect(
      deploys["WhitelistUserChosenNFTSale"].address,
      provider
    );
   
    saleContract = saleContract.connect(owner);
  });

  it("can buy NFT from range", async () => {
    await testNFT.setMinters([saleContract.address]);

    const price = 100;

    const users = [
      { address: await randomAcc.getAddress(), price: price },
    ];

    const elements = users.map((x) =>
      solidityKeccak256(["address", "uint256"], [x.address, x.price])
    );

    const merkleTree = new MerkleTree(elements, keccak256, { sort: true });

    const merkleRoot = merkleTree.getHexRoot();

    const leaf = elements[0];

    await saleContract.createSale(merkleRoot, 0, 10);
    
    saleContract = saleContract.connect(randomAcc);
    
    const merkleProof = merkleTree.getHexProof(leaf);

    await buyNft(
      saleContract, 
      5,
      price,
      merkleRoot,
      merkleProof
    );

    expect(await testNFT.ownerOf(5)).to.equal(await randomAcc.getAddress());
  });
});

const buyNft = async (saleContract: WhitelistUserChosenNFTSale, tokenId: number, price: number, merkleRoot: string, merkleProof: string[]) => {
  const tx = await saleContract.buy(
    merkleRoot, 
    merkleProof, 
    tokenId,
    price,
    {
      value: price
    }
  );

  await tx.wait();
};
