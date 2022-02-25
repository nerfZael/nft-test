import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;
  const metadatApiBaseUri = "http://nft.neuralfield.com:8080/api/nft/";

  const testNFT = await deploy("TestNFT", {
    contract: "TestNFT",
    from: deployer,
    args: [
      ethers.constants.AddressZero,
      metadatApiBaseUri
    ],
    log: true,
  });
  
  const whitelistPredeterminedNFTSale = await deploy("WhitelistPredeterminedNFTSale", {
    contract: "WhitelistPredeterminedNFTSale",
    from: deployer,
    args: [
      testNFT.address,
    ],
    log: true,
  });
  
  return !useProxy;
};
export default func;
func.id = "test_nft";
func.tags = ["all"];
