// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface IRailsEscrow {

  function addSeller(address seller) external;

  function removeSeller(address seller) external;

  function addAssetId(address assetId) external;

  function removeAssetId(address assetId) external;

  function addLiqudity() external;

  function removeLiqudity() external;

  function prepare() external;

  function fulfill() external;

  function cancel() external;

  function getSwapStatus() external view;

  function getSwapHash() external view;
}