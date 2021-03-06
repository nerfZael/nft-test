// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./utils/MerkleProof.sol";
import "./TestNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error AmountToLow();
error AmountToHigh();
error InvalidProof();
error AlreadyClaimed();
error SoldOut();
error SaleNotFound();

/**
 * @title WhitelistPredeterminedNFTSale
 * WhitelistPredeterminedNFTSale - a contract for a selling NFTs
 */
contract WhitelistPredeterminedNFTSale {
    struct Sale {
        mapping(address => bool) claimedAddresses;
        bool exists;
    }

    mapping(bytes32 => Sale) public sales;

    event Claimed(bytes32 merkleRoot, address account);

    TestNFT public nftContract;

    constructor(TestNFT _nftContract) {
        nftContract = _nftContract;
    }

    function createSale(
        bytes32 merkleRoot
    ) external {
        sales[merkleRoot].exists = true;
    }

    function verify(bytes32 merkleRoot, bytes32[] memory merkleProof, address account, uint256 tokenId, uint256 price) private view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(account, tokenId, price));
     
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    function hasClaimedNFT(bytes32 merkleRoot, address account) external view returns (bool) {
        return sales[merkleRoot].claimedAddresses[account];
    }

    function buy(bytes32 merkleRoot, bytes32[] calldata merkleProof, uint256 tokenId, uint256 price) external payable returns (uint256) {
        Sale storage sale = sales[merkleRoot];

        if(!sale.exists) {
            revert SaleNotFound();
        } 

        if(msg.value < price) {
            revert AmountToLow();
        } else if(msg.value > price) {
            revert AmountToHigh();
        }

        address msgSender = _msgSender();

        if(sale.claimedAddresses[msgSender]) {
            revert AlreadyClaimed();
        }
        sale.claimedAddresses[msgSender] = true;

        bool isValid;
        isValid = verify(merkleRoot, merkleProof, msgSender, tokenId, price);

        if(!isValid) {
            revert InvalidProof();
        }
      
        nftContract.mintById(msgSender, tokenId);

        emit Claimed(merkleRoot, msgSender);
    }

    function _msgSender() private returns (address) {
        return msg.sender;
    }
}