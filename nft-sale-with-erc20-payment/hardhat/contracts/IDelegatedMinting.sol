// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IDelegatedMinting {
    function isMinter(address account) external view returns (bool);
    function mintById(address to, uint256 tokenId) external;
}