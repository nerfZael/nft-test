// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC721Tradable.sol";
import "./IDelegatedMinting.sol";
import "./MintManagement.sol";

/**
 * @title TestNFT
 * TestNFT - a contract for a non-fungible token
 */
contract TestNFT is MintManagement {
    string baseUri;

    constructor(address _proxyRegistryAddress, string memory _baseUri)
        ERC721Tradable("TestNFT", "TNFT", _proxyRegistryAddress) {
        baseUri = _baseUri;
    }

    function setBaseUri(string memory _baseUri) public onlyOwner {
        baseUri = _baseUri;
    }

    function baseTokenURI() override public view returns (string memory) {
        return baseUri;
    }

    function setTrustedForwarder(address forwarder, bool trusted) public onlyOwner override returns(bool) {
        super.setTrustedForwarder(forwarder, trusted);
    }
}