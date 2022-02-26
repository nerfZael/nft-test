// SPDX-License-Identifier:MIT
pragma solidity ^0.8.11;

import "./interfaces/IRelayRecipient.sol";

/**
 * A base contract to be inherited by any contract that wants to receive relayed transactions
 * A subclass must use "_msgSender()" instead of "msg.sender"
 */
abstract contract RelayRecipient is IRelayRecipient {
    /*
     * Forwarders we accept calls from
     */
    mapping(address => bool) public trustedForwarders;

    /*
     * require a function to be called through a trusted forwarder only
     */
    modifier trustedForwarderOnly() {
        require(trustedForwarders[msg.sender], "Function can only be called through a trusted forwarder");
        _;
    }

    function isTrustedForwarder(address forwarder) public override view returns(bool) {
        return trustedForwarders[forwarder];
    }

    function setTrustedForwarder(address forwarder, bool trusted) public override virtual returns(bool) {
        trustedForwarders[forwarder] = trusted;
        emit TrustedForwarderSet(forwarder, trusted);
    }
}