import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
// const {Brand, SerialNumber, Duration} = require("./product.json");
const Product = {
  Brand: "ETH",
  SerialNumber: "ETH023154895489",
  Duration: 2,
};

export default buildModule("MyAuctionModule", (m) => {
  const brand = m.getParameter("_brand", Product.Brand);
  const serialNumber = m.getParameter("_serialNumber", Product.SerialNumber);
  const duration = m.getParameter("_duration", Product.Duration);

  const myAuction = m.contract("MyAuction", [brand, serialNumber, duration]);

  return { myAuction };
});
