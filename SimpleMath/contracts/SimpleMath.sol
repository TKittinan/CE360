// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract SimpleMath {
  function add(uint x, uint y) public pure returns (uint) {
    return x + y;
  }
  function subtract(uint x, uint y) public pure returns (uint) {
    require(x >= y, "subtract: result would be negative");
    return x - y;
  }
  function multiply(uint x, uint y) public pure returns (uint) {
    return x * y;
  }
  function divide(uint x, uint y) public pure returns (uint) {
    require(y != 0, "divide: division by zero");
    return x / y;
  }
}
