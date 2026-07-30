// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {BridgeEvents} from "../events/BridgeEvents.sol";
import {BridgeWrappedToken} from "../tokens/BridgeWrappedToken.sol";

/// @title BridgeGateway
/// @notice Unified bridge gateway that routes cross-chain lock, burn, mint, and
///         unlock operations and emits standardized MessageSent / MessageDelivered
///         / MessageFailed events for consistent off-chain indexing.
/// @dev Source-chain operations (lock / burn) send tokens into the gateway and emit
///      MessageSent. Destination-chain operations (mint / unlock) release tokens
///      from the gateway and emit MessageDelivered or MessageFailed.
contract BridgeGateway is BridgeEvents {
    using SafeERC20 for IERC20;

    /// @notice Source chain identifier for this deployment.
    uint32 public immutable chainId;

    /// @notice The BridgeWrappedToken used for mint/burn flows.
    BridgeWrappedToken public immutable wrappedToken;

    /// @notice Maps destination chain → next outbound nonce.
    mapping(uint32 => uint64) public outboundNonces;

    error ZeroAddress();
    error ZeroAmount();
    error Unauthorized();

    event LiquidityWithdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(uint32 _chainId, address _wrappedToken) {
        if (_wrappedToken == address(0)) revert ZeroAddress();
        chainId = _chainId;
        wrappedToken = BridgeWrappedToken(_wrappedToken);
    }

    /// @notice Lock native tokens into the gateway and emit a standardized
    ///         cross-chain MessageSent event (source-chain lock flow).
    /// @param dstChainId   Target destination chain.
    /// @param token        ERC-20 token address to lock.
    /// @param amount       Amount of tokens to lock.
    /// @param recipient    32-byte recipient identifier on destination.
    /// @return msgHash     Unique message hash.
    /// @return nonce       Assigned outbound nonce.
    function lock(
        uint32 dstChainId,
        address token,
        uint256 amount,
        bytes32 recipient
    ) external returns (bytes32 msgHash, uint64 nonce) {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        nonce = outboundNonces[dstChainId];
        outboundNonces[dstChainId] = nonce + 1;

        msgHash = keccak256(abi.encodePacked(chainId, dstChainId, nonce, token, amount, recipient));

        emit MessageSent(msgHash, chainId, dstChainId, nonce);
    }

    /// @notice Burn wrapped tokens and emit a standardized MessageSent event
    ///         (source-chain burn flow).
    /// @param dstChainId   Target destination chain.
    /// @param account      The holder whose wrapped tokens are burnt.
    /// @param amount       Amount of wrapped tokens to burn.
    /// @param recipient    32-byte recipient identifier on destination.
    /// @return msgHash     Unique message hash.
    /// @return nonce       Assigned outbound nonce.
    function burn(
        uint32 dstChainId,
        address account,
        uint256 amount,
        bytes32 recipient
    ) external returns (bytes32 msgHash, uint64 nonce) {
        if (account == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        wrappedToken.burnFrom(account, amount);

        nonce = outboundNonces[dstChainId];
        outboundNonces[dstChainId] = nonce + 1;

        msgHash = keccak256(abi.encodePacked(chainId, dstChainId, nonce, account, amount, recipient));

        emit MessageSent(msgHash, chainId, dstChainId, nonce);
    }

    /// @notice Mint wrapped tokens upon verified cross-chain message delivery
    ///         and emit a standardized MessageDelivered event (destination-chain
    ///         mint flow).
    /// @param msgHash     Unique message hash (emitted by source).
    /// @param srcChainId  Source chain identifier.
    /// @param to          Address to receive the minted wrapped tokens.
    /// @param amount      Amount of wrapped tokens to mint.
    function mint(
        bytes32 msgHash,
        uint32 srcChainId,
        address to,
        uint256 amount
    ) external {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        wrappedToken.mint(to, amount);

        emit MessageDelivered(msgHash, srcChainId, chainId, true);
    }

    /// @notice Unlock native tokens upon verified cross-chain message delivery
    ///         and emit a standardized MessageDelivered event (destination-chain
    ///         unlock flow).
    /// @param msgHash     Unique message hash (emitted by source).
    /// @param srcChainId  Source chain identifier.
    /// @param token       ERC-20 token address to unlock.
    /// @param to          Address to receive the unlocked tokens.
    /// @param amount      Amount of tokens to unlock.
    function unlock(
        bytes32 msgHash,
        uint32 srcChainId,
        address token,
        address to,
        uint256 amount
    ) external {
        if (token == address(0)) revert ZeroAddress();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransfer(to, amount);

        emit MessageDelivered(msgHash, srcChainId, chainId, true);
    }

    /// @notice Report a failed cross-chain message and emit a standardized
    ///         MessageFailed event (destination-chain fallback flow).
    /// @param msgHash     Unique message hash (emitted by source).
    /// @param srcChainId  Source chain identifier.
    /// @param recipient   The intended fallback recipient.
    /// @param token       The bridged token address.
    /// @param amount      The amount escrowed.
    function fail(
        bytes32 msgHash,
        uint32 srcChainId,
        address recipient,
        address token,
        uint256 amount
    ) external {
        if (recipient == address(0)) revert ZeroAddress();

        emit MessageFailed(msgHash, srcChainId, chainId, recipient, token, amount);
    }

    /// @notice Withdraw accidentally sent tokens from the gateway.
    function withdrawLiquidity(address token, uint256 amount, address to) external {
        if (token == address(0)) revert ZeroAddress();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransfer(to, amount);
        emit LiquidityWithdrawn(token, to, amount);
    }
}
