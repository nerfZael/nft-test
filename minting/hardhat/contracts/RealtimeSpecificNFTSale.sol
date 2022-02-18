// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import "./ERC721Tradable.sol";
import "./TestNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error AmountToLow();
error AmountToHigh();
error InvalidSignature();

/**
 * @title RealtimeSpecificNFTSale
 * RealtimeSpecificNFTSale - a contract for a selling NFTs
 */
contract RealtimeSpecificNFTSale {
   struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }

    struct Sale {
        uint256 tokenId;
        uint256 price;
    }

    bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 constant SALE_TYPEHASH = keccak256(
        "Sale(uint256 tokenId,uint256 price)"
    );
    bytes32 DOMAIN_SEPARATOR;

    TestNFT public nftContract;
    address public signer;

    constructor(TestNFT _nftContract) {
        nftContract = _nftContract;
        DOMAIN_SEPARATOR = hash(EIP712Domain({
            name: "Test Domain",
            version: '0.1.0',
            chainId: 1,
            verifyingContract: address(this)
        }));
    }

    function setSigner(address _signer) external {
        signer = _signer;
    }

    function hash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes(eip712Domain.name)),
            keccak256(bytes(eip712Domain.version)),
            eip712Domain.chainId,
            eip712Domain.verifyingContract
        ));
    }
    function hash(Sale memory sale) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            SALE_TYPEHASH,
            sale.tokenId,
            sale.price
        ));
    }

    function verify(Sale memory sale, uint8 v, bytes32 r, bytes32 s) internal view returns (bool) {
        // Note: we need to use `encodePacked` here instead of `encode`.
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            hash(sale)
        ));
        return ecrecover(digest, v, r, s) == address(signer);
    }

    function buy(uint256 tokenId, uint256 price, uint8 v, bytes32 r, bytes32 s) public payable returns (uint256) {
        if(msg.value < price) {
            revert AmountToLow();
        } else if(msg.value > price) {
            revert AmountToHigh();
        }

        if(!verify(Sale(tokenId, price), v, r, s)) {
            revert InvalidSignature();
        }

        nftContract.mintById(_msgSender(), tokenId);
    }

    function _msgSender() private returns (address) {
        return msg.sender;
    }
}