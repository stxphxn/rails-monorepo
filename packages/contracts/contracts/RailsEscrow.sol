// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./interfaces/IRailsEscrow.sol";
import "./libraries/LibAsset.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    mapping (bytes32 => bytes32) internal swaps;

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
        require(approvedAssets[assetId] == false, "#AA:001");

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
    function addLiquidity(uint256 amount, address assetId) external override nonReentrant {
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
    function removeLiquidity(uint256 amount, address assetId) external override nonReentrant {
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

    function prepare(
        SwapInfo calldata swapInfo,
        bytes calldata prepareSignature
    ) external override nonReentrant returns(SwapData memory) {       
        // Sanity check: buyer is sensible
        require(swapInfo.buyer != address(0), "#P:001");

        // Sanity check: seller is sensible
        require(swapInfo.seller != address(0), "#P:002");

        // Check seller is approved
        require(approvedSellers[swapInfo.seller], "#P:004");

        // check asset is approved
        require(approvedAssets[swapInfo.assetId], "#P:005");

        // check seller has enough liquidity
        uint256 balance = sellerBalances[swapInfo.seller][swapInfo.assetId];
        require(balance >= swapInfo.amount, "#P:006");

        // check swap doesn't already exist
        bytes32 digest = keccak256(abi.encode(swapInfo));
        require(swaps[digest] == 0, "#P:007");

        // Validate signature
        require(msg.sender == owner() || _recoverFuncSignature(digest, "prepare", prepareSignature) == owner(), "#F:02");

        uint32 expiry = uint32(block.timestamp) + SWAP_LOCK_TIME;
        // store swap expiry
        swaps[digest] = _hashSwapTransactionData(swapInfo.amount, expiry, block.number);

        // Decrement the seller's liquidity
        // using unchecked because underflow protected against with require
        unchecked {
            sellerBalances[swapInfo.seller][swapInfo.assetId] = balance - swapInfo.amount;
        }

        SwapData memory swapData = SwapData({
            buyer: swapInfo.buyer,
            seller: swapInfo.seller,
            oracle: swapInfo.oracle,
            assetId: swapInfo.assetId,
            amount: swapInfo.amount,
            swapId: swapInfo.swapId,
            currencyHash: swapInfo.currencyHash,
            prepareBlockNumber: block.number,
            expiry: expiry
        });

        emit SwapPrepared(digest, swapData, msg.sender);
        return swapData;
    }

    function fulfil(
        SwapData calldata swapData, 
        bytes calldata fulfilSignature
    ) external override nonReentrant {
        // Check if the swap exists
        bytes32 digest = getSwapHash(swapData);

        // Make sure that the swap transaction data matches what was stored
        require(swaps[digest] == _hashSwapTransactionData(swapData.amount, swapData.expiry, swapData.prepareBlockNumber), "#F:01");

        // Make sure the expiry has not elapsed
        require(swapData.expiry >= block.timestamp, "#F:020");

        // Make sure the swap wasn't already completed
        require(swapData.prepareBlockNumber > 0, "#F:021");

        // Validate signature
        require(msg.sender == swapData.seller || _recoverFuncSignature(digest, "fulfil", fulfilSignature) == owner(), "#F:02");
        
        // To prevent a swap from being repeated the prepareBlockNumber is set to 0 before being hashed
        swaps[digest] = _hashSwapTransactionData(swapData.amount, swapData.expiry, 0);

        // transfer assets to buyer
        LibAsset.transferAsset(swapData.assetId, payable(swapData.buyer), swapData.amount);

        emit SwapFulfiled(digest, swapData, msg.sender);
    }

    function cancel(
        SwapData calldata swapData,
        bytes calldata cancelSignature
    ) external override nonReentrant {
        // check swap exists
        bytes32 digest = getSwapHash(swapData);
        
        // Make sure that the swap transaction data matches what was stored
        require(swaps[digest] == _hashSwapTransactionData(swapData.amount, swapData.expiry, swapData.prepareBlockNumber), "#F:019");
        
        // Make sure the swap wasn't already completed
        require(swapData.prepareBlockNumber > 0, "#C:021");
        
        if (swapData.expiry >= block.timestamp) {
          // Timeout has not expired and swap may only be cancelled by the buyer
          // Validate signature
          require(msg.sender == swapData.buyer || _recoverFuncSignature(digest, "cancel", cancelSignature) == swapData.buyer, "#C:025");
        }
        
        // To prevent a swap from being repeated the prepareBlockNumber is set to 0 before being hashed
        swaps[digest] = _hashSwapTransactionData(swapData.amount, swapData.expiry, 0);

        // Return liquidity to seller
        sellerBalances[swapData.seller][swapData.assetId] += swapData.amount;

        emit SwapCancelled(digest, swapData, msg.sender);
    }

    function getSwapStatus(SwapInfo calldata swapInfo) external view override returns (bytes32 status) {
        bytes32 digest = keccak256(abi.encode(swapInfo));
        return swaps[digest];
    }

    function getSwapHash(SwapData calldata swapData) public pure override returns (bytes32) {
        SwapInfo memory info = SwapInfo({
            buyer: swapData.buyer,
            seller: swapData.seller,
            oracle: swapData.oracle,
            assetId: swapData.assetId,
            amount: swapData.amount,
            swapId: swapData.swapId,
            currencyHash: swapData.currencyHash
        });
        return keccak256(
            abi.encode(info)
        );
    }

    function _hashSwapTransactionData(uint256 amount, uint256 expiry, uint256 prepareBlockNumber) internal pure returns (bytes32) {
        SwapTransactionData memory transactionData = SwapTransactionData({
            amount: amount,
            expiry: expiry,
            prepareBlockNumber: prepareBlockNumber
        });
        return keccak256(abi.encode(transactionData));
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

      /**
      * @notice Recovers the signer from the signature provided by the oracle
      * @param swapHash The swap hash
      * @param signature The signature you are recovering the signer from
      */
    function _recoverFuncSignature(
      bytes32 swapHash,
      string memory func,
      bytes calldata signature
    ) internal pure returns (address) {
        // Create the signed payload
        SignedFulfilData memory payload = SignedFulfilData({
          functionIdentifier: func,
          swapHash: swapHash
        });

        // Recover
        return _recoverSignature(abi.encode(payload), signature);
    }


    /**
    * @notice Holds the logic to recover the signer from an encoded payload.
    *         Will hash and convert to an eth signed message.
    * @param encodedPayload The payload that was signed
    * @param signature The signature you are recovering the signer from
    */
    function _recoverSignature(bytes memory encodedPayload, bytes calldata  signature) internal pure returns (address) {
        // Recover
        return ECDSA.recover(
          ECDSA.toEthSignedMessageHash(keccak256(encodedPayload)),
          signature
        );
    }

}
