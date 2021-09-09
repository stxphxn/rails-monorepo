// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface IRailsEscrow {

  struct SwapInfo {
    address buyer;
    address seller;
    address assetId;
    uint256 amount;
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
  event SwapPrepared(bytes32 swapHash, address caller);

  event SwapFulfilled(bytes32 swapHash, address caller);

  event SwapCancelled(bytes32 swapHash, address caller);

  
  function addSeller(address seller) external;

  function removeSeller(address seller) external;

  function addAssetId(address assetId) external;

  function removeAssetId(address assetId) external;

  function addLiqudity(uint256 amount, address assetId) external;

  function removeLiqudity(uint256 amount, address assetId) external;

  function prepare(SwapInfo calldata swapInfo, string calldata currencyHash) external;

  function fulfill(SwapInfo calldata swapInfo, string calldata currencyHash) external;

  function cancel(SwapInfo calldata swapInfo, string calldata currencyHash) external;

  function getSwapStatus(SwapInfo calldata swapInfo, string calldata currencyHash) external view returns (uint32 status);

  function getSwapHash(SwapInfo calldata swapInfo, string calldata currencyHash) external pure returns (bytes32);
}