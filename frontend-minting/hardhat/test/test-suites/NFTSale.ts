import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  NFTSale,
  NFTSale__factory,
  TestNFT,
  TestNFT__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";

describe("NFT Sale", () => {
  let testNFT: TestNFT;
  let nftSale: NFTSale;
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

    nftSale = NFTSale__factory.connect(
      deploys["NFTSale"].address,
      provider
    );
   
    nftSale = nftSale.connect(owner);
  });

  it("can buy NFT", async () => {
    await testNFT.setMinters([nftSale.address]);
    
    //TODO Timed messages
   
    await nftSale.setSigner(await owner.getAddress());
   
    nftSale = nftSale.connect(randomAcc);

    await reserveAndBuy(
      await randomAcc.getAddress(), 
      {
        tokenId: 0,
        price: 10
      }, 
      nftSale, 
      owner as JsonRpcSigner
    );

    await reserveAndBuy(
      await randomAcc.getAddress(), 
      {
        tokenId: 2,
        price: 20
      }, 
      nftSale, 
      owner as JsonRpcSigner
    );

    expect(await testNFT.ownerOf(0)).to.equal(await randomAcc.getAddress());
    expect(await testNFT.ownerOf(2)).to.equal(await randomAcc.getAddress());
  });
});

const reserveAndBuy = async (buyerAddress: string, saleInfo: SaleInfo, nftSale: NFTSale, signer: JsonRpcSigner) => {
  const signature = await reserveNft(buyerAddress, saleInfo, nftSale.address, signer);

  const tx = await nftSale.buy(
    saleInfo.tokenId, 
    saleInfo.price,
    signature.v, 
    signature.r, 
    signature.s, 
    {
      value: saleInfo.price
    }
  );

  await tx.wait();
};

const signData = async (buyerAddress: string, verifyingContractAddress: string, types: any, value: any, signer: JsonRpcSigner) => {
  const domain = {
    name: 'Test Domain',
    version: '0.1.0',
    chainId: 1,
    verifyingContract: verifyingContractAddress
  };
  
  let signature = await signer._signTypedData(domain, types, value);

  const signedByAddress = ethers.utils.verifyTypedData(domain, types, value, signature)

  expect(signedByAddress).to.equal(await signer.getAddress());

  signature = signature.substring(2);
  const r = "0x" + signature.substring(0, 64);
  const s = "0x" + signature.substring(64, 128);
  const v = parseInt(signature.substring(128, 130), 16);
  
  return {
    v,
    r,
    s
  };
};

const reserveNft = async (buyerAddress: string, saleInfo: SaleInfo, verifyingContractAddress: string, signer: JsonRpcSigner) => {
  const types = {
    Sale: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'price', type: 'uint256' }
    ]
  };

  const { v, r, s } = await signData(buyerAddress, verifyingContractAddress, types, saleInfo, signer);

  return { v, r, s };
};

export type SaleInfo = {
  tokenId: number;
  price: number;
}