// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./utils/MerkleProof.sol";
import "./IDelegatedMinting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error AmountToLow();
error AmountToHigh();
error InvalidProof();
error AlreadyClaimed();
error SoldOut();
error SaleNotFound();

/**
 * @title WhitelistNFTRangeSale
 * WhitelistNFTRangeSale - a contract for a selling NFTs
 */
contract WhitelistNFTRangeSale {
    struct Sale {
        uint256 fromTokenId;
        uint256 toTokenId;
        uint256 currentTokenId;
        mapping(address => bool) claimedAddresses;
        bool exists;
    }

    mapping(bytes32 => Sale) public sales;

    event Claimed(bytes32 merkleRoot, address account);

    IDelegatedMinting public nftContract;

    constructor(IDelegatedMinting _nftContract) {
        nftContract = _nftContract;
    }

    function createSale(
        bytes32 merkleRoot,
        uint256 fromTokenId,
        uint256 toTokenId
    ) external {
        sales[merkleRoot].fromTokenId = fromTokenId;
        sales[merkleRoot].toTokenId = toTokenId;
        sales[merkleRoot].currentTokenId = fromTokenId; 
        sales[merkleRoot].exists = true;
    }

    function verify(bytes32 merkleRoot, bytes32[] memory merkleProof, address account, uint256 price) private view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(account, price));
     
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    function hasClaimedNFT(bytes32 merkleRoot, address account) external view returns (bool) {
        return sales[merkleRoot].claimedAddresses[account];
    }

    function buy(bytes32 merkleRoot, bytes32[] calldata merkleProof, uint256 price) external payable returns (uint256) {
        Sale storage sale = sales[merkleRoot];

        if(!sale.exists) {
            revert SaleNotFound();
        } 

        if(msg.value < price) {
            revert AmountToLow();
        } else if(msg.value > price) {
            revert AmountToHigh();
        }

        if(sale.currentTokenId >= sale.toTokenId) {
            revert SoldOut();
        }

        address msgSender = _msgSender();

        if(sale.claimedAddresses[msgSender]) {
            revert AlreadyClaimed();
        }
        sale.claimedAddresses[msgSender] = true;

        bool isValid;
        isValid = verify(merkleRoot, merkleProof, msgSender, price);

        if(!isValid) {
            revert InvalidProof();
        }

        uint256 tokenToMint = sale.currentTokenId;
        sale.currentTokenId++;
      
        nftContract.mintById(msgSender, tokenToMint);

        emit Claimed(merkleRoot, msgSender);
    }

    function _msgSender() private returns (address) {
        return msg.sender;
    }
}