// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./utils/MerkleProof.sol";
import "./TestNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error AmountToLow();
error AmountToHigh();
error InvalidAccountProof();
error InvalidTokenPriceProof();
error AlreadyClaimed();
error SoldOut();
error SaleNotFound();
error TokenNotForSale();

/**
 * @title WhitelistUserChosenSpecificPriceNFTSale
 * WhitelistUserChosenSpecificPriceNFTSale - a contract for a selling NFTs
 */
contract WhitelistUserChosenSpecificPriceNFTSale {
    struct Sale {
        bytes32 priceMerkleRoot;
        uint256 fromTokenId;
        uint256 toTokenId;
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
        bytes32 priceMerkleRoot,
        uint256 fromTokenId,
        uint256 toTokenId
    ) external {
        sales[merkleRoot].priceMerkleRoot = priceMerkleRoot;
        sales[merkleRoot].fromTokenId = fromTokenId;
        sales[merkleRoot].toTokenId = toTokenId;
        sales[merkleRoot].exists = true;
    }

    function verifyAccount(bytes32 merkleRoot, bytes32[] memory merkleProof, address account) private view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(account));

        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    function verifyTokenPrice(bytes32 priceMerkleRoot, bytes32[] calldata priceMerkleProof, uint256 tokenId, uint256 price) private view returns (bool) {
        bytes32 tokenPriceNode = keccak256(abi.encodePacked(tokenId, price));

        return MerkleProof.verify(priceMerkleProof, priceMerkleRoot, tokenPriceNode);
    }

    function hasClaimedNFT(bytes32 merkleRoot, address account) external view returns (bool) {
        return sales[merkleRoot].claimedAddresses[account];
    }

    function getTokenRangeForSale(bytes32 merkleRoot) external view returns (uint256 fromTokenId, uint256 toTokenId) {
        return (sales[merkleRoot].fromTokenId, sales[merkleRoot].toTokenId);
    }

    function buy(bytes32 merkleRoot, bytes32[] calldata merkleProof, bytes32[] calldata priceMerkleProof, uint256 tokenId, uint256 price) external payable returns (uint256) {
        Sale storage sale = sales[merkleRoot];

        if(!sale.exists) {
            revert SaleNotFound();
        } 

        if(msg.value < price) {
            revert AmountToLow();
        } else if(msg.value > price) {
            revert AmountToHigh();
        }

        if(tokenId < sale.fromTokenId) {
            revert TokenNotForSale();
        } else if (tokenId > sale.toTokenId) {
            revert TokenNotForSale();
        }

        address msgSender = _msgSender();

        if(sale.claimedAddresses[msgSender]) {
            revert AlreadyClaimed();
        }
        sale.claimedAddresses[msgSender] = true;

        if(!verifyAccount(merkleRoot, merkleProof, msgSender)) {
            revert InvalidAccountProof();
        }

        if(!verifyTokenPrice(sale.priceMerkleRoot, priceMerkleProof, tokenId, price)) {
            revert InvalidTokenPriceProof();
        }

        nftContract.mintById(msgSender, tokenId);

        emit Claimed(merkleRoot, msgSender);
    }

    function _msgSender() private returns (address) {
        return msg.sender;
    }
}