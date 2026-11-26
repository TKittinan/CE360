// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0 < 0.9.0;

import "./Auction.sol";
contract MyAuction is Auction {
    Product public product;
    AuctionState public STATE;
    uint256 public endTime; //อะไรก็ตามที่เป็น Public จะเรียกชื่อมันใช้function ได้เลย เช่น highestBid() จะได้ค่า highestBid ออกมา
    uint256 public highestBid; 
    address public highestBidder;
    address[] public bidders;

    mapping(address => uint256) public bids; //เก็บยอดเงินที่ประมูลของแต่ละคน **mapping ออกสอบแน่นอน อาจารย์บอก ต้องจำ**

    event EndedEvent(string message, uint256 timestamp);      // แจ้งว่าประมูลจบแล้ว
    event CancelledEvent(string message, uint256 timestamp);  // แจ้งว่าประมูลถูกยกเลิก

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function"); // ใส่functionไหน จะได้ใช้ได้แค่เจ้าของเท่านั้น
        _;
    }
    modifier notAnOwner() {
        require(msg.sender != owner, "Owner cannot call this function"); // ใส่functionไหน เจ้าของห้ามใช้
        _;
    }
    modifier onGoingAuction() {
        require(STATE == AuctionState.STARTED, "Auction is not ongoing"); // ใส่functionไหน จะได้ใช้ได้แค่ตอนประมูลกำลังดำเนินอยู่
        _;
    }
    constructor(string memory _brand, string memory _serialNumber, uint256 _duration) {
        owner = payable(msg.sender); // msg = global object ใช้ได้ทุกตัว
        product = Product(_brand, _serialNumber);
        STATE = AuctionState.STARTED;
        //endTime = block.timestamp + _duration * 1 minutes;
        endTime = block.timestamp + _duration * 1 seconds;//minutes;
    }

    function bid() external payable override notAnOwner onGoingAuction { //**ต้องจำ ออกสอบแน่นอน #1 อาจารย์บอก**
        require(
            msg.value + bids[msg.sender] > highestBid, 
            "Bid must be higher than current highest bid"
        );           
        require(
            msg.sender != highestBidder, 
            "You are already the highest bidder"
        );

        highestBidder = msg.sender;                                                                                                                                           
        if (bids[msg.sender] == 0) {                                                                           
            bidders.push(msg.sender);  // เช็กก่อนบวก เพื่อเก็บเฉพาะครั้งแรก                                                             
        }
        bids[msg.sender] += msg.value; // บวกแค่ครั้งเดียว
        highestBid = bids[msg.sender];
        emit BidEvent(msg.sender, bids[msg.sender], block.timestamp);
    }

    // ดูยอดเงินที่ประมูลของตัวเองและผู้อื่น
    function getMyBid(address bidder) external view override returns (uint256){
        return bids[bidder];
    }

    // จบการประมูล
    function endAuction() external override onlyOwner onGoingAuction{
        STATE = AuctionState.ENDED;
        emit EndedEvent("Auction has ended", block.timestamp);
    }

    // ยกเลิกการประมูล
    function cancelAuction() external override onlyOwner onGoingAuction {
        STATE = AuctionState.CANCELED;
        emit CancelledEvent("Auction has been cancelled", block.timestamp);
    }

    // ถอนเงิน
    function withdraw() external override {
        uint256 amount = 0;
        address payable withdrawer = payable(msg.sender);
        require(STATE != AuctionState.STARTED, "Auction is still ongoing");
        if(withdrawer == owner) { // Owner can withdraw the highest bid
            require(STATE == AuctionState.ENDED, "Owner can only withdraw after auction ended");
            require(bids[highestBidder] > 0, "No funds to withdraw for highest bidder");
            amount = highestBid;
            bids[highestBidder] = 0; // Reset the highest bidder's bid
        } else { // Other bidders can withdraw their bids
            bool allowed = ((STATE == AuctionState. ENDED && withdrawer != highestBidder) ||
                (STATE == AuctionState.CANCELED)) &&
                bids[withdrawer] > 0;
            require(allowed, "You are not allowed to withdraw");
            amount = bids[withdrawer];
            bids[withdrawer] = 0;
        }
        (bool sent, ) = payable(withdrawer).call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit WithdrawEvent(withdrawer, amount, block.timestamp);
    }
    // ดูรายละเอียดสินค้า
    function getProductInfo() external view override 
    returns (string memory, string memory) 
    {
        return (product.Brand, product.SerialNumber);
    }
}