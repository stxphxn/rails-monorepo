// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./interfaces/IRailsEscrow.sol";
import "./lib/LibAsset.sol";

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RailsEscrow is ReentrancyGuard, Ownable, IRailsEscrow {

    uint32 internal constant SWAP_LOCK_TIME = 24 hours;
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
    /**
      * @notice This is used by any seller to increase their available
      *         liquidity for a given asset.
      * @param amount The amount of liquidity to add for the seller
      * @param assetId The address (or `address(0)` if native asset) of the
      *                asset you're adding liquidity for
      */
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

    /**
      * @notice This is used by any seller to decrease their available
      *         liquidity for a given asset.
      * @param amount The amount of liquidity to remove for the seller
      * @param assetId The address (or `address(0)` if native asset) of the
      *                asset you're removing liquidity for
      */
    function removeLiqudity(uint256 amount, address assetId) external override nonReentrant {
        // Sanity check: nonzero amounts
        require(amount > 0, "#RL:002");

        uint256 sellerBalance = sellerBalances[msg.sender][assetId];
        // Sanity check: amount can be deducted for the router
        require(sellerBalance >= amount, "#RL:008");

        // Update router balances
        unchecked {
          sellerBalances[msg.sender][assetId] = sellerBalance - amount;
        }

        // Transfer from contract to specified recipient
        LibAsset.transferAsset(assetId, payable(msg.sender), amount);

        // Emit event
        emit LiquidityRemoved(msg.sender, assetId, amount, msg.sender);
    }

    function prepare(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {
        // Sanity check: buyer is sensible
        require(swapInfo.buyer != address(0), "#P:009");

        // Sanity check: seller is sensible
        require(swapInfo.seller != address(0), "#P:001");

        // Check seller is approved
        require(approvedSellers[swapInfo.seller], "#P:003");

        // check asset is approved
        require(approvedAssets[swapInfo.assetId], "#P:004");

        // check seller has enough liquidity
        uint256 balance = sellerBalances[swapInfo.seller][swapInfo.assetId];
        require(balance >= swapInfo.amount, "#P:018");

        // check swap doesn't already exist
        bytes32 digest = getSwapHash(swapInfo, currencyHash);
        require(swaps[digest] == 0, "#P:015");

        // store swap expiry
        swaps[digest] = uint32(block.timestamp) + SWAP_LOCK_TIME;

      // Decrement the seller's liquidity
      // using unchecked because underflow protected against with require
        unchecked {
          sellerBalances[swapInfo.seller][swapInfo.assetId] = balance - swapInfo.amount;
        }

        emit SwapPrepared(digest, msg.sender);
    }

    function fulfill(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function cancel(SwapInfo calldata swapInfo, string calldata currencyHash) external override nonReentrant {}

    function getSwapStatus(SwapInfo calldata swapInfo, string calldata currencyHash) external view override returns (uint32 status) {
        bytes32 digest = getSwapHash(swapInfo, currencyHash);
        return swaps[digest];
    }

    function getSwapHash(SwapInfo calldata swapInfo, string calldata currencyHash) public pure override returns (bytes32) {
        return keccak256(
            abi.encode(swapInfo, currencyHash)
        );
    }

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
