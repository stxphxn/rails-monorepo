// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./interfaces/IRailsEscrow.sol";
import "./lib/LibAsset.sol";

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    /**
      * @notice Used to add assets that can
      *         be swapped.
      * @param assetId AssetId to add
      */
    function addAssetId(address assetId) external override onlyOwner {
        // Sanity check: needs approval
        require(approvedAssets[assetId] == false, "#AA:032");

        // Update mapping
        approvedAssets[assetId] = true;

        // Emit event
        emit AssetAdded(assetId, msg.sender);
    }

    /**
      * @notice Used to remove assets that can
      *         be swapped.
      * @param assetId AssetId to remove
      */
    function removeAssetId(address assetId) external override onlyOwner {
        // Sanity check: already approval
        require(approvedAssets[assetId] == true, "#RA:033");

        // Update mapping
        approvedAssets[assetId] = false;

        // Emit event
        emit AssetRemoved(assetId, msg.sender);
    }

    function addLiqudity(uint256 amount, address assetId) external override nonReentrant {
        // Sanity check: nonzero amounts
        require(amount > 0, "#AL:002");

        require(approvedSellers[msg.sender], "#AL:003");

        require(approvedAssets[assetId] == true, "#AL:004");
        
        // Transfer funds to contract
        amount = _transferAssetToContract(assetId, amount);

        // Update the seller balances.
        sellerBalances[msg.sender][assetId] += amount;

        emit LiquidityAdded(msg.sender, assetId, amount, msg.sender);
    }

    function removeLiqudity(uint256 amount, address assetId) external override nonReentrant {}

    function prepare(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function fulfill(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function cancel(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function getSwapStatus() external view override returns (uint32 status) {}

    function getSwapHash() external view override returns (bytes32) {}

  /**
    * @notice Handles transferring funds from msg.sender to the
    *          transaction manager contract. Used in prepare, addLiquidity
    * @param assetId The address to transfer
    * @param specifiedAmount The specified amount to transfer. May not be the 
    *                        actual amount transferred (i.e. fee on transfer 
    *                        tokens)
    */
  function _transferAssetToContract(address assetId, uint256 specifiedAmount) internal returns (uint256) {
    uint256 trueAmount = specifiedAmount;

    // Validate correct amounts are transferred
    if (LibAsset.isNativeAsset(assetId)) {
      require(msg.value == specifiedAmount, "#TA:005");
    } else {
      uint256 starting = LibAsset.getOwnBalance(assetId);
      require(msg.value == 0, "#TA:006");
      LibAsset.transferFromERC20(assetId, msg.sender, address(this), specifiedAmount);
      // Calculate the *actual* amount that was sent here
      trueAmount = LibAsset.getOwnBalance(assetId) - starting;
    }

    return trueAmount;
  }
}
