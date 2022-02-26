// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "./RelayRecipient.sol";

abstract contract RelayRecipientAndContextMixin is RelayRecipient {
    function msgSender()
        internal
        view
        returns (address payable sender)
    {
        if (msg.data.length >= 24 && isTrustedForwarder(msg.sender)) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                sender := shr(96,calldataload(sub(calldatasize(),20)))
            }
        } else if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = payable(msg.sender);
        }

        return sender;
    }

    /**
     * return the sender of this call.
     * if the call came through a trusted forwarder, return the original sender.
     * otherwise, return `msg.sender`.
     * should be used in the contract anywhere instead of msg.sender
     */
}