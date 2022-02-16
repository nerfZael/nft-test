import hre, { ethers, deployments } from "hardhat";
import chai, { expect } from "chai";
import {
  TestNFT,
  TestNFT__factory,
} from "../../typechain-types";
import { Signer } from "ethers";

describe("Publishing versions", () => {
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
});
