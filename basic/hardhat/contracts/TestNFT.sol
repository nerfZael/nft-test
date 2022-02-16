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
    string baseUri;

    constructor(address _proxyRegistryAddress, string memory _baseUri)
        ERC721Tradable("TestNFT", "TNFT", _proxyRegistryAddress)
    {
        baseUri = _baseUri;
    }

    function baseTokenURI() override public view returns (string memory) {
        return baseUri;
    }
}