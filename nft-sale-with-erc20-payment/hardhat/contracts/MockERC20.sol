// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * MockERC20 - a contract for a fungible token
 */
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol)
    ERC20(name, symbol) {

    }
    
    function mint(address recipient, uint256 amount) external {
        _mint(recipient, amount);
    }
}