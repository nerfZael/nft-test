// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error FailedToSendEther();

/**
 * @title OwnerWithdrawable
 * OwnerWithdrawable - owner can withdraw eth and erc20 tokens
 */
contract OwnerWithdrawable is Ownable {
    function withdraw(
        address receiver,
        uint256 ethAmount,
        address[] memory erc20Addresses,
        uint256[] memory erc20Amounts
    ) external onlyOwner {
        //If eth amount to withdraw is not zero then withdraw it     
        if(ethAmount != 0) {

            (bool sent, bytes memory data) = receiver.call{value: ethAmount}("");
        
            if(!sent) {
                revert FailedToSendEther();
            }
        }

        for(uint256 i =0; i < erc20Addresses.length; i++) {
            uint256 amount = erc20Amounts[i];

            IERC20 token = IERC20(erc20Addresses[i]);

            token.approve(receiver, amount);
            token.transfer(receiver, amount);
        }
    }
}