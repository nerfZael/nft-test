import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  const testNFT = await deploy("TestNFT", {
    contract: "TestNFT",
    from: deployer,
    args: [],
    log: true,
  });

  return !useProxy;
};
export default func;
func.id = "test_nft";
func.tags = ["all"];
