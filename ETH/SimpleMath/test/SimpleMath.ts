import { assert } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("SimpleMath", function () {
  async function deploy() {
    return await ethers.deployContract("SimpleMath");
  }

  let simpleMath: Awaited<ReturnType<typeof deploy>>;

  // deploy contract ครั้งเดียวก่อนเริ่มเทสต์
  // ทั้ง 4 ฟังก์ชันเป็น pure ไม่เก็บ state เทสไม่กระทบกัน สามารถเทสต์ได้ทุกฟังก์ชัน
  before(async function () {
    simpleMath = await deploy();
  });

  it("should add two numbers correctly", async function () {
    // assert.equal(ค่าที่ได้จริง, ค่าที่คาดไว้)
    // เลขต้องมี n ต่อท้าย (2n, 5n) เพราะ SimpleMath ใช้ uint256 ซึ่งเป็น BigInt
    assert.equal(await simpleMath.add(2n, 3n), 5n);
    assert.equal(await simpleMath.add(7n, 0n), 7n);
  });

  it("should subtract two numbers correctly", async function () {
    assert.equal(await simpleMath.subtract(5n, 3n), 2n);
    assert.equal(await simpleMath.subtract(4n, 4n), 0n);
  });

  it("should multiply two numbers correctly", async function () {
    assert.equal(await simpleMath.multiply(4n, 3n), 12n);
    assert.equal(await simpleMath.multiply(9n, 0n), 0n);
  });

  it("should divide two numbers correctly", async function () {
    assert.equal(await simpleMath.divide(10n, 2n), 5n);
    // Solidity ไม่เอาทศนิยม หารแล้วต้องเอาเศษทิ้ง เช่น 7 / 2 = 3.5  cut -> 3
    assert.equal(await simpleMath.divide(7n, 2n), 3n);
  });
});