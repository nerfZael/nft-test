// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./utils/MerkleProof.sol";
import "./TestNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidEtherAmount();
error InvalidProof();
error AlreadyClaimed();
error SoldOut();
error SaleNotFound();
error TokenBalanceToLow();
error NotEnoughTokensAllowed();
error InvalidPaymentAmount();
error InvalidERC20TokenUsedAsPayment();

/**
 * @title WhitelistPredeterminedNFTSale
 * WhitelistPredeterminedNFTSale - a contract for a selling NFTs
 */
contract WhitelistPredeterminedNFTSale {
    struct Sale {
        mapping(address => bool) claimedAddresses;
        mapping(address => uint256) erc20Prices;
        bool exists;
        uint256 ethPrice;
    }

    mapping(bytes32 => Sale) public sales;

    event Claimed(bytes32 merkleRoot, address account);

    TestNFT public nftContract;

    constructor(TestNFT _nftContract) {
        nftContract = _nftContract;
    }

    function createSale(
        bytes32 merkleRoot,
        uint256 ethPrice,
        address[] memory erc20Addresses,
        uint256[] memory erc20Prices
    ) external {
        sales[merkleRoot].exists = true;
        sales[merkleRoot].ethPrice = ethPrice;
        
        for(uint256 i =0; i < erc20Addresses.length; i++) {
            sales[merkleRoot].erc20Prices[erc20Addresses[i]] = erc20Prices[i];
        }
    }

    function verify(bytes32 merkleRoot, bytes32[] memory merkleProof, address account, uint256 tokenId) private view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(account, tokenId));
     
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    function hasClaimedNFT(bytes32 merkleRoot, address account) external view returns (bool) {
        return sales[merkleRoot].claimedAddresses[account];
    }

    function pay(address erc20Address, Sale storage sale) private {
        if(erc20Address == address(0)) {
            uint256 ethPrice = sale.ethPrice;

            if(msg.value != ethPrice) {
                revert InvalidEtherAmount();
            } 
        } else {
            //Check if the ERC20 token is allowed as payment
            if(sale.erc20Prices[erc20Address] == 0) {
                revert InvalidERC20TokenUsedAsPayment();
            }

            //Get the price of the NFT in the ERC20 token
            uint256 price = sale.erc20Prices[erc20Address];

            //Get the ERC20 token used for payment
            IERC20 token = IERC20(erc20Address);

            //Check if the buyer has enough tokens
            uint256 tokenBalance = token.balanceOf(address(_msgSender()));
            if(tokenBalance < price) {
                revert TokenBalanceToLow();
            }

            //Get the amount of tokens allowed to be spent
            uint256 allowance = token.allowance(msg.sender, address(this));

            //Check if the buyer allowed enough tokens to be used for the payment
            if(allowance < price) {
                revert NotEnoughTokensAllowed();
            }

            token.transferFrom(msg.sender, address(this), price);
        }
    }

    function buy(bytes32 merkleRoot, bytes32[] calldata merkleProof, uint256 tokenId, address erc20Address) external payable returns (uint256) {
        Sale storage sale = sales[merkleRoot];

        if(!sale.exists) {
            revert SaleNotFound();
        } 

        bool isValid;
        isValid = verify(merkleRoot, merkleProof, _msgSender(), tokenId);

        if(!isValid) {
            revert InvalidProof();
        }

        pay(erc20Address, sale);

        address msgSender = _msgSender();

        if(sale.claimedAddresses[msgSender]) {
            revert AlreadyClaimed();
        }

        sale.claimedAddresses[msgSender] = true;
      
        nftContract.mintById(msgSender, tokenId);

        emit Claimed(merkleRoot, msgSender);
    }

    function _msgSender() private returns (address) {
        return msg.sender;
    }
}