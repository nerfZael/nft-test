import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  TestNFT,
  TestNFT__factory,
  WhitelistUserChosenSpecificPriceNFTSale,
  WhitelistUserChosenSpecificPriceNFTSale__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";
import keccak256 from "keccak256";

import { MerkleTree } from "merkletreejs";

describe("Whitelist User Chosen Specific Price NFT Sale", () => {
  let testNFT: TestNFT;
  let saleContract: WhitelistUserChosenSpecificPriceNFTSale;
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
      
    saleContract = WhitelistUserChosenSpecificPriceNFTSale__factory.connect(
      deploys["WhitelistUserChosenSpecificPriceNFTSale"].address,
      provider
    );
   
    saleContract = saleContract.connect(owner);
  });

  it("can buy NFT from range", async () => {
    await testNFT.setMinters([saleContract.address]);

    const users = [
      { address: await randomAcc.getAddress() },
    ];

    const tokenPrices = [
      { tokenId: 0, price: 10 },
      { tokenId: 1, price: 11 },
      { tokenId: 2, price: 12 },
      { tokenId: 3, price: 13 },
    ];

    const elements = users.map((x) =>
      solidityKeccak256(["address"], [x.address])
    );

    const priceElements = tokenPrices.map((x) =>
      solidityKeccak256(["uint256", "uint256"], [x.tokenId, x.price])
    );

    const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
    const priceMerkleTree = new MerkleTree(priceElements, keccak256, { sort: true });

    const merkleRoot = merkleTree.getHexRoot();
    const priceMerkleRoot = priceMerkleTree.getHexRoot();

    const leaf = elements[0];
    const priceLeaf = priceElements[1];

    await saleContract.createSale(merkleRoot, priceMerkleRoot, 0, 10);
    const tokenRange = await saleContract.getTokenRangeForSale(merkleRoot);

    expect(tokenRange.fromTokenId.toNumber()).to.equal(0);
    expect(tokenRange.toTokenId.toNumber()).to.equal(10);
  
    saleContract = saleContract.connect(randomAcc);
    
    const merkleProof = merkleTree.getHexProof(leaf);
    const priceMerkleProof = priceMerkleTree.getHexProof(priceLeaf);
    
    await buyNft(
      saleContract, 
      1,
      11,
      merkleRoot,
      merkleProof,
      priceMerkleProof
    );

    expect(await testNFT.ownerOf(1)).to.equal(await randomAcc.getAddress());
  });
});

const buyNft = async (saleContract: WhitelistUserChosenSpecificPriceNFTSale, tokenId: number, price: number, merkleRoot: string, merkleProof: string[], priceMerkleProof: string[]) => {
  const tx = await saleContract.buy(
    merkleRoot, 
    merkleProof, 
    priceMerkleProof,
    tokenId,
    price,
    {
      value: price
    }
  );

  await tx.wait();
};
