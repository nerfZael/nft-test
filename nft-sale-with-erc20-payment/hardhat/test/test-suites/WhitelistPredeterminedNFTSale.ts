import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  TestNFT,
  TestNFT__factory,
  WhitelistPredeterminedNFTSale,
  WhitelistPredeterminedNFTSale__factory,
  MockERC20,
  MockERC20__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";
import keccak256 from "keccak256";

import { MerkleTree } from "merkletreejs";

describe("Whitelist Specific NFT Sale", () => {
  let testNFT: TestNFT;
  let saleContract: WhitelistPredeterminedNFTSale;
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

    saleContract = WhitelistPredeterminedNFTSale__factory.connect(
      deploys["WhitelistPredeterminedNFTSale"].address,
      provider
    );
   
    saleContract = saleContract.connect(owner);
  });

  
  it("can buy NFT with ether", async () => {
    await testNFT.setMinters([saleContract.address]);

    const price = 100;
    const tokenId = 5;

    const users = [
      { address: await randomAcc.getAddress(), tokenId: tokenId },
    ];

    const elements = users.map((x) =>
      solidityKeccak256(["address", "uint256"], [x.address, x.tokenId ])
    );

    const merkleTree = new MerkleTree(elements, keccak256, { sort: true });

    const merkleRoot = merkleTree.getHexRoot();

    const leaf = elements[0];

    await saleContract.createSale(merkleRoot, price, [], []);
    
    saleContract = saleContract.connect(randomAcc);
    
    const merkleProof = merkleTree.getHexProof(leaf);

    await buyNft(
      saleContract, 
      tokenId,
      price,
      ethers.constants.AddressZero,
      merkleRoot,
      merkleProof
    );

    expect(await testNFT.ownerOf(tokenId)).to.equal(await randomAcc.getAddress());
  });

  it("can buy NFT with an erc20 token", async () => {
    let erc20TokenContract = await (new MockERC20__factory(owner)).deploy("Test", "T");

    await erc20TokenContract.mint(await randomAcc.getAddress(), 100);

    await testNFT.setMinters([saleContract.address]);

    const price = 100;
    const tokenId = 5;
    erc20TokenContract = erc20TokenContract.connect(randomAcc);
    await erc20TokenContract.approve(saleContract.address, 100);

    const users = [
      { address: await randomAcc.getAddress(), tokenId: tokenId },
    ];

    const elements = users.map((x) =>
      solidityKeccak256(["address", "uint256"], [x.address, x.tokenId ])
    );

    const merkleTree = new MerkleTree(elements, keccak256, { sort: true });

    const merkleRoot = merkleTree.getHexRoot();

    const leaf = elements[0];

    await saleContract.createSale(merkleRoot, 0, [erc20TokenContract.address], [price]);
    
    saleContract = saleContract.connect(randomAcc);
    
    const merkleProof = merkleTree.getHexProof(leaf);

    await buyNft(
      saleContract, 
      tokenId,
      price,
      erc20TokenContract.address,
      merkleRoot,
      merkleProof
    );

    expect(await testNFT.ownerOf(tokenId)).to.equal(await randomAcc.getAddress());
  });
});

const buyNft = async (saleContract: WhitelistPredeterminedNFTSale, tokenId: number, price: number, erc20TokenAddress: string, merkleRoot: string, merkleProof: string[]) => {
  const tx = await saleContract.buy(
    merkleRoot, 
    merkleProof, 
    tokenId,
    erc20TokenAddress,
    {
      value: price
    },
  );

  await tx.wait();
};
