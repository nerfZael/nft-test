import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  TestNFT,
  TestNFT__factory,
} from "../../typechain-types";
import { Signer } from "ethers";

describe("Test NFT", () => {
  let testNFT: TestNFT;
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
  });

  it("sanity", async () => {
    const baseUri = await testNFT.baseTokenURI();

    expect(baseUri).to.equal("http://nft.neuralfield.com:8080/api/nft/");
  });


  it("can mint by id", async () => {
    await testNFT.setMinters([await owner.getAddress()]);
    await testNFT.mintById(await randomAcc.getAddress(), 0);
    await testNFT.mintById(await randomAcc.getAddress(), 1);

    expect(await testNFT.ownerOf(0)).to.equal(await randomAcc.getAddress());
    expect(await testNFT.ownerOf(1)).to.equal(await randomAcc.getAddress());
  });
});
