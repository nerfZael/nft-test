// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./ERC721Tradable.sol";
import "./IDelegatedMinting.sol";

abstract contract ERC721MintManagement is ERC721Tradable, IDelegatedMinting {
    mapping(address => bool) public minters;

    function setMinters(address[] memory _minters) external {
        for(uint i = 0; i < _minters.length; i++) {
            minters[_minters[i]] = true;
        }
    }

    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }

    function mintById(address to, uint256 tokenId) public onlyMinters {
        _safeMint(to, tokenId);
    }

    function mintTo(address _to) public override onlyMinters {
        super.mintTo(_to);
    }

    /**
        * @dev Throws if called by any account other than an authorized minter.
        */
    modifier onlyMinters() {
        require(minters[_msgSender()], "Caller is not an authorized minter");
        _;
    }
}