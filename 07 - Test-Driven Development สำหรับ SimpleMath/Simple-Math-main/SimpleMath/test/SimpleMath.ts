import { expect, assert } from "chai";
import { network } from "hardhat";

// ต่อเข้า network จำลองของ Hardhat (รันในเครื่อง ไม่ต้องเปิดอะไรเพิ่ม)
// ethers ที่ได้จากตรงนี้ใช้ deploy contract และเรียกฟังก์ชันได้เลย
const { ethers } = await network.create();

describe("SimpleMath", function () {
  async function deploy() {
    return await ethers.deployContract("SimpleMath");
  }

  let simpleMath: Awaited<ReturnType<typeof deploy>>;

  // deploy แค่ครั้งเดียวก่อนเริ่มเทสต์
  // เพราะทั้ง 4 ฟังก์ชันเป็น pure ไม่เก็บ state เทสต์ไม่กระทบกันอยู่แล้ว
  before(async function () {
    simpleMath = await deploy();
  });

  // ---------- add ----------
  it("should add two numbers correctly", async function () {
    // assert.equal(ค่าที่ได้จริง, ค่าที่คาดไว้)
    // ถ้าเท่ากัน -> ผ่าน / ถ้าไม่เท่ากัน -> throw AssertionError เทสต์ fail
    // ตัวเลขต้องมี n ต่อท้าย (2n, 5n) เพราะ ethers v6 ส่งค่า uint กลับมาเป็น bigint
    assert.equal(await simpleMath.add(2n, 3n), 5n);
    assert.equal(await simpleMath.add(7n, 0n), 7n); // บวก 0 ต้องได้เลขเดิม
  });

  it("should revert when add overflows", async function () {
    // MaxUint256 คือค่ามากสุดของ uint256 บวก 1 เข้าไปจะล้น
    // Solidity 0.8+ จะ revert ให้เอง (Panic overflow)
    // สังเกต: ไม่ใส่ await ข้างในเพราะ expect ต้องได้ promise ไปตรวจเอง
    // แต่ข้างหน้า expect ต้องมี await เสมอ ไม่งั้นเทสต์ผ่านปลอมโดยไม่ได้ตรวจจริง
    await expect(simpleMath.add(ethers.MaxUint256, 1n)).to.revert(ethers);
  });

  // ---------- subtract ----------
  it("should subtract two numbers correctly", async function () {
    assert.equal(await simpleMath.subtract(5n, 3n), 2n);
    assert.equal(await simpleMath.subtract(4n, 4n), 0n); // เท่ากันได้ 0 ไม่ใช่ error
  });

  it("should revert when subtract goes negative", async function () {
    // uint ติดลบไม่ได้ ใน contract เลยเช็ก require(x >= y) ไว้
    // revertedWith ตรวจข้อความ error ด้วย ต้องตรงกับใน SimpleMath.sol เป๊ะ
    await expect(simpleMath.subtract(3n, 5n)).to.be.revertedWith(
      "subtract: result would be negative",
    );
  });

  // ---------- multiply ----------
  it("should multiply two numbers correctly", async function () {
    assert.equal(await simpleMath.multiply(4n, 3n), 12n);
    assert.equal(await simpleMath.multiply(9n, 0n), 0n); // คูณ 0 ได้ 0
  });

  it("should revert when multiply overflows", async function () {
    // เหมือนตอนบวก แต่คราวนี้ล้นเพราะคูณ
    await expect(simpleMath.multiply(ethers.MaxUint256, 2n)).to.revert(ethers);
  });

  // ---------- divide ----------
  it("should divide two numbers correctly", async function () {
    assert.equal(await simpleMath.divide(10n, 2n), 5n);
    // Solidity ไม่มีทศนิยม หารแล้วตัดเศษทิ้ง 7 / 2 ได้ 3 (ไม่ใช่ 3.5)
    assert.equal(await simpleMath.divide(7n, 2n), 3n);
  });

  it("should revert when dividing by zero", async function () {
    // หารด้วย 0 ไม่ได้ ใน contract ดักไว้ด้วย require(y != 0)
    await expect(simpleMath.divide(10n, 0n)).to.be.revertedWith(
      "divide: division by zero",
    );
  });
});