const ethers = require("ethers");

const getSignerAddress = (message, signature) => {
  const domain = {
    name: 'Planet Mojo',
    version: '0.1.0',
    //Polygon is 137
    chainId: 137
  };
  
  const types = {
    Action: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'action', type: 'string' },
    ]
  };

  const signedByAddress = ethers.utils.verifyTypedData(domain, types, message, signature)

  return signedByAddress;
};

const sign = async (domain, types, message, signer) => {
  let signature = await signer._signTypedData(domain, types, message);

  const signedByAddress = ethers.utils.verifyTypedData(domain, types, message, signature)

  //Assert.equal(signedByAddress, signer.address);
  console.log("user address", signer.address);
  console.log("signedByAddress", signedByAddress);

  return signature;
};

async function main() {
  const wallet = ethers.Wallet.createRandom();

  const domain = {
    name: 'Planet Mojo',
    version: '0.1.0',
    //Polygon is 137
    chainId: 137
  };
  
  const types = {
    Action: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'action', type: 'string' },
    ]
  };

  const originalMessage = {
    tokenId: 1,
    action: 'sprout-mojo'
  };

  const signature = await sign(
    domain,
    types,
    originalMessage, 
    wallet
  );

  console.log("signature", signature);

  const expectedMessage = {
    tokenId: 1,
    action: 'sprout-mojo'
  };

  const signerAddress = getSignerAddress(expectedMessage, signature);
  console.log("signerAddress", signerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
