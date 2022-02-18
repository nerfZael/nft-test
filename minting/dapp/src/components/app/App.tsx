import "./App.scss";
import { useEffect, useState } from "react";
import { ToastProvider } from "react-toast-notifications";
import React from "react";
import { useWeb3 } from "../../hooks/useWeb3";
import { toPrettyHex } from "../../helpers/toPrettyHex";
import { ethers } from "ethers";

type NftItem = {
  name: string;
}

const App: React.FC = () => {
  const [web3, setWeb3] = useWeb3();
  const [userNftList, setUserNftList] = useState<NftItem[]>([]);

  useEffect(() => {
    if (!web3) {
      return;
    }

   
  }, [web3]);

  const buyNft = async () => {
    if(!web3) {
      return;
    }

    const mintingContract = new ethers.Contract(process.env.REACT_APP_NFT_CONTRACT_ADDRESS!, [
      "function mint() payable returns (uint256)"
    ]);

    await mintingContract.mint();

    console.log("Bought NFT");
  };

  return (
    <div className="App">
      <ToastProvider>
        {
          web3 ? (
            <div>
              <div>
                Account: {toPrettyHex(web3.account)}
              </div>
              <div>
                <button onClick={async () =>
                    await buyNft()
                  }>Buy</button>
              </div>

              <div>
                {
                  userNftList.length
                    ? userNftList.map((x: NftItem, i) => (<div>aaa</div>)) 
                    : <div>No NFTs minted</div>
                }
              </div>
            </div>
          ) : (
            <div>Connect a wallet...</div>
          )
        }
        
      </ToastProvider>
    </div>
  );
};

export default App;
