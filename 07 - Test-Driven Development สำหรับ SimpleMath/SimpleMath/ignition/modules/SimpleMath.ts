import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleMathModule", (m) => { // function to deploy
  const simpleMath = m.contract("SimpleMath"); // contract ชื่อควรใช้ชื่อเดียวกันกับไฟล์
  return { simpleMath };
});
