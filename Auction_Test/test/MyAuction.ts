import { expect } from "chai";
import { network } from "hardhat";
const Product = require("../ignition/modules/product.json");

const { ethers } = await network.create();
// [a,b,c]
//    |
// [x,y,z]
// (number/string) => BigNumber
// Typecasting ==> แปลงชนิดข้อมูลจากชนิดหนึ่งไปยังอีกชนิดหนึ่ง
describe("MyAuction", function () {
  let myAuction: any;
  let owner: any;
  let bidders: any;
  let sampleBidAmount: any = [1,1.2,1.5,2,2.5,3];
  let sampleBidAmountInwei: any = sampleBidAmount.map((amount: any) => 
    ethers.parseEther(amount.toString()));
  
  beforeEach(async function () {
    console.log("Deploying MyAuction contract...");
    myAuction = await ethers.deployContract("MyAuction",[Product.Brand, Product.SerialNumber, Product.Duration]);
    [owner, ...bidders] = await ethers.getSigners(); // Wallet ตัวแรก เก็บใน owner ส่วน wallet ตัวอื่นๆ เก็บใน bidders
  });

  it("Should return product information", async function () {
    const [_brand, _serialNumber] = await myAuction.getProductInfo();
    expect(_brand).to.equal(Product.Brand);
    expect(_serialNumber).to.equal(Product.SerialNumber);
  });
  
  it("should allow bidders to place bids", async function (){  //**ออกสอบแน่นอน #1 อาจารย์บอก ต้องจำ**
    for (let i = 0; i < sampleBidAmountInwei.length; i++) {
      const ct = await myAuction.connect(bidders[i]); // connect bidder's wallet to contrct
      const tx = await ct.bid({ value : sampleBidAmountInwei[i] });
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
      const highestBid = await myAuction.highestBid();

      const bidAmount = await myAuction.getMyBid(bidders[i].address); //อะไรที่ต้องการaddress ก็ต้องใช้ .address
      expect(bidAmount).to.equal(sampleBidAmountInwei[i]);
      expect(highestBid).to.equal(sampleBidAmountInwei[i]);
    }
  });

  const AUCTION_STATES = {"STARTED" : 0, "ENDED" : 1, "CANCELED" : 2};
  const delayInSeconds = (s: number) => new Promise((resolve) => setTimeout(resolve, s * 1000));
  it("should end the aution", async function () {
      const ct = await myAuction.connect(owner);
      await delayInSeconds(Product.Duration + 3); // wait for auction duration to end
      const tx = await ct.endAuction();
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
      const auctionState = await ct.STATE();
      expect(auctionState).to.equal(AUCTION_STATES.ENDED);
  });

  it("should cancel the auction", async function () {
    it("should end the aution", async function () {
      const ct = await myAuction.connect(owner);
      const tx = await ct.endAuction();
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
      const auctionState = await ct.STATE();
      expect(auctionState).to.equal(AUCTION_STATES.CANCELED);
    });

    it("should make a withdrawal after auction ends", async function () {
        let ct, tx, receipt;
        for (let i = 0; i < sampleBidAmountInwei.length; i++) {
          ct = await myAuction.connect(bidders[i]);
          tx = await ct.bid({ value : sampleBidAmountInwei[i] });
          receipt = await tx.wait();
        }
        await delayInSeconds(Product.Duration + 3); // wait for auction duration to end
        ct = await myAuction.connect(owner);
        tx = await ct.endAuction();
        receipt = await tx.wait();
        let i;
        for (let i = 0; i < sampleBidAmountInwei.length - 1; i++) {
          ct = await myAuction.connect(bidders[i]);
          await expect(await ct.withdraw()).to.changeEtherBalance(ethers, bidders[i], sampleBidAmountInwei[i]);
          ct = await myAuction.connect(owner);
          await expect(await ct.withdraw()).to.changeEtherBalance(ethers, owner, sampleBidAmountInwei[i]);
        }
    });

    it("should make a withdrawal after auction cancelled", async function () {
        let ct, tx, receipt;
        for (let i = 0; i < sampleBidAmountInwei.length; i++) {
          ct = await myAuction.connect(bidders[i]);
          tx = await ct.bid({ value : sampleBidAmountInwei[i] });
          receipt = await tx.wait();
        }
        ct = myAuction.connect(owner);
        tx = await ct.endAuction();
        receipt = await tx.wait();
        let i;
        for (let i = 0; i < sampleBidAmountInwei.length - 1; i++) {
          ct = await myAuction.connect(bidders[i]);
          await expect(await ct.withdraw()).to.changeEtherBalance(ethers, bidders[i], sampleBidAmountInwei[i]);
          ct = await myAuction.connect(owner);
          await expect(await ct.withdraw()).to.revertedWith("Owner can only withdraw after ended");
        }
    });
  })
});