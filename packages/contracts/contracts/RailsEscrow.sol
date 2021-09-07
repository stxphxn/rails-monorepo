// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./interfaces/IRailsEscrow.sol";

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RailsEscrow is ReentrancyGuard, Ownable, IRailsEscrow {
    /**
      * @dev Mapping of seller to balance specific to asset
      */
    mapping(address => mapping(address => uint256)) public sellerBalances;
    
    /**
      * @dev Mapping of allowed seller addresses. Must be added to both
      */
    mapping(address => bool) public approvedSellers;

    /**
      * @dev Mapping of allowed assetIds
      */
    mapping(address => bool) public approvedAssets;
        
    /**
     * @dev Mapping from swap details hash to its end time (as a unix timestamp).
     * After the end time the swap can be cancelled, and the funds will be returned to the pool.
     */
    mapping (bytes32 => uint32) internal swaps;

    /**
      * @notice Used to add sellers that can add liqudity
      * @param seller Seller address to add
      */
    function addSeller(address seller) external override onlyOwner {
        // Sanity check: not empty
        require(seller != address(0), "#AS:001");

        // Sanity check: needs approval
        require(approvedSellers[seller] == false, "#AS:032");

        // Update mapping
        approvedSellers[seller] = true;

        // Emit event
        emit SellerAdded(seller, msg.sender);
    }

    /**
      * @notice Used to remove sellers that can add liqudity
      * @param seller Seller address to remove
      */
    function removeSeller(address seller) external override onlyOwner {
        // Sanity check: not empty
        require(seller != address(0), "#RS:001");

        // Sanity check: needs approval
        require(approvedSellers[seller] == true, "#RS:032");

        // Update mapping
        approvedSellers[seller] = false;

        // Emit event
        emit SellerRemoved(seller, msg.sender);
    }

    function addAssetId(address assetId) external override onlyOwner {}

    function removeAssetId(address assetId) external override onlyOwner {}

    function addLiqudity() external override nonReentrant {}

    function removeLiqudity() external override nonReentrant {}

    function prepare(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function fulfill(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function cancel(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function getSwapStatus() external view override returns (uint32 status) {}

    function getSwapHash() external view override returns (bytes32) {}
}
