// SPDX-License-Identifier:MIT
pragma solidity ^0.8.11;

/**
 * a contract must implement this interface in order to support relayed transaction.
 * It is better to inherit the BaseRelayRecipient as its implementation.
 */
abstract contract IRelayRecipient {
    /**
     * Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event TrustedForwarderSet(address indexed forwarder, bool trusted);

    /**
     * return if the forwarder is trusted to forward relayed transactions to us.
     * the forwarder is required to verify the sender's signature, and verify
     * the call is not a replay.
     */
    function isTrustedForwarder(address forwarder) public virtual view returns(bool);

    /*
     * Sets a address as a trusted forwarder or not, depending on the "trusted" flag.
     * Emits a {TrustedForwarderSet} event.
     */
    function setTrustedForwarder(address forwarder, bool trusted) public virtual returns(bool);
}