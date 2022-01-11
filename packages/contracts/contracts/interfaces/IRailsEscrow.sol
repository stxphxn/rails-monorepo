// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface IRailsEscrow {

  struct SwapInfo {
    address buyer;
    address seller;
    address oracle;
    address assetId;
    uint256 amount;
    uint256 swapId;
  }

  struct SwapData {
    address buyer;
    address seller;
    address oracle;
    address assetId;
    uint256 amount;
    uint256 swapId;
    uint256 prepareBlockNumber;
    uint256 expiry;
  }

  struct SignedFunctionData {
    string functionIdentifier;
    bytes32 swapHash;
  }

  struct SwapTransactionData {
    uint256 amount;
    uint256 expiry;
    uint256 prepareBlockNumber;
  }

  // Adding/removing seller events
  event SellerAdded(address indexed addedSeller, address indexed caller);

  event SellerRemoved(address indexed removedSeller, address indexed caller);

  // Adding/removing asset events
  event AssetAdded(address indexed addedAssetId, address indexed caller);

  event AssetRemoved(address indexed removedAssetId, address indexed caller);

  // Liquidity events
  event LiquidityAdded(address indexed seller, address indexed assetId, uint256 amount, address caller);

  event LiquidityRemoved(address indexed seller, address indexed assetId, uint256 amount, address recipient);

  // Swap events
  event SwapPrepared(bytes32 swapHash, SwapData swapData, address caller);

  event SwapFulfiled(bytes32 swapHash, SwapData swapData, address caller);

  event SwapCancelled(bytes32 swapHash, SwapData swapData, address caller);

  
  function addSeller(address seller) external;

  function removeSeller(address seller) external;

  function addAssetId(address assetId) external;

  function removeAssetId(address assetId) external;

  function addLiquidity(uint256 amount, address assetId) external;

  function removeLiquidity(uint256 amount, address assetId) external;

  function prepare(SwapInfo calldata swapInfo, bytes calldata prepareSignature) external returns(SwapData memory);

  function fulfil(SwapData calldata swapData, bytes calldata fulfilSignature) external;

  function cancel(SwapData calldata swapData, bytes calldata cancelSignature) external;

  function getSwapStatus(SwapInfo calldata swapInfo) external view returns (bytes32 status);

  function getSwapHash(SwapData calldata swapData) external pure returns (bytes32);
}