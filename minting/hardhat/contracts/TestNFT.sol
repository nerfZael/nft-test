// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./IDelegatedMinting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestNFT
 * TestNFT - a contract for a non-fungible token
 */
contract TestNFT is ERC721Tradable, IDelegatedMinting {
    string baseUri;
    mapping(address => bool) public minters;

    constructor(address _proxyRegistryAddress, string memory _baseUri)
        ERC721Tradable("TestNFT", "TNFT", _proxyRegistryAddress) {
        baseUri = _baseUri;
    }

    function setMinters(address[] memory _minters) external {
        for(uint i = 0; i < _minters.length; i++) {
            minters[_minters[i]] = true;
        }
    }

    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }

    function baseTokenURI() override public view returns (string memory) {
        return baseUri;
    }

    function mintById(address to, uint256 tokenId) public onlyMinters {
        _safeMint(to, tokenId);
    }

    /**
     * @dev Throws if called by any account other than an authorized minter.
     */
    modifier onlyMinters() {
        require(minters[_msgSender()], "Caller is not an authorized minter");
        _;
    }
}