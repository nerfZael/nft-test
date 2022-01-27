// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestNFT
 * TestNFT - a contract for a non-fungible token
 */
contract TestNFT is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        ERC721Tradable("TestNFT", "TNFT", _proxyRegistryAddress)
    {}

    function baseTokenURI() override public pure returns (string memory) {
        return "http://nft.neuralfield.com:8080/api/nft/";
    }
}