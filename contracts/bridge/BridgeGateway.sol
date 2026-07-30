// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title IBridgeVault
/// @notice Minimal interface for the core bridge vault used by gateways/routers.
interface IBridgeVault {
    function lock(
        uint32 destinationChainId,
        address token,
        uint256 amount,
        bytes32 recipient
    ) external;
}

/// @title BridgeGateway
/// @notice Source-chain entry point for single-token bridge deposits, bounded
///         by a per-token configurable maximum deposit limit. This caps the
///         potential loss from any single malicious or anomalous operation
///         (e.g. an oracle glitch or flash-loan-funded transfer) by rejecting
///         deposits above the configured cap before they ever reach the
///         lock/burn routine on the vault.
contract BridgeGateway is AccessControl {
    using SafeERC20 for IERC20;

    /// @notice Core bridge vault that receives token deposits and performs
    ///         the lock/burn routine.
    IBridgeVault public immutable vault;

    /// @notice Per-token maximum amount allowed in a single deposit.
    /// @dev A value of `0` means "no limit configured" (unlimited), mirroring
    ///      the `DepositGuard` convention of treating zero as "unbounded"
    ///      rather than "blocked". Admins must explicitly opt a token into a
    ///      bounded cap via `setMaxDepositLimit`.
    mapping(address => uint256) public maxDepositLimit;

    event MaxDepositLimitSet(address indexed token, uint256 amount);
    event DepositLocked(
        address indexed token,
        address indexed sender,
        uint256 amount,
        uint32 destinationChainId,
        bytes32 recipient
    );

    error ZeroAddress();
    error ZeroAmount();
    /// @notice Thrown when a deposit amount exceeds the configured cap for
    ///         the token being deposited.
    error DepositExceedsLimit(uint256 amount, uint256 limit);

    constructor(address _vault, address admin) {
        if (_vault == address(0)) revert ZeroAddress();
        if (admin == address(0)) revert ZeroAddress();
        vault = IBridgeVault(_vault);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Set (or update) the maximum single-deposit amount allowed for
    ///         a given token. Callable only by an account holding
    ///         `DEFAULT_ADMIN_ROLE`, allowing caps to be adjusted dynamically
    ///         as conditions change.
    /// @param token  ERC-20 token to bound.
    /// @param amount New maximum allowed amount per deposit; `0` disables the
    ///               cap (unlimited) for this token.
    function setMaxDepositLimit(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddress();
        maxDepositLimit[token] = amount;
        emit MaxDepositLimitSet(token, amount);
    }

    /// @notice Deposit a single ERC-20 token into the bridge vault for
    ///         cross-chain transfer, subject to the configured per-token
    ///         maximum deposit limit.
    /// @param token              ERC-20 token to bridge.
    /// @param amount             Amount to bridge.
    /// @param destinationChainId Destination chain identifier.
    /// @param recipient          32-byte normalized recipient on destination.
    function deposit(
        address token,
        uint256 amount,
        uint32 destinationChainId,
        bytes32 recipient
    ) external {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 limit = maxDepositLimit[token];
        if (limit > 0 && amount > limit) {
            revert DepositExceedsLimit(amount, limit);
        }

        // Pull tokens from the caller and forward directly to the vault,
        // then initiate the lock/burn routine. SafeERC20 reverts
        // automatically on transfer failures.
        IERC20(token).safeTransferFrom(msg.sender, address(vault), amount);
        vault.lock(destinationChainId, token, amount, recipient);

        emit DepositLocked(token, msg.sender, amount, destinationChainId, recipient);
    }
}
