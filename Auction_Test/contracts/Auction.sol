// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

abstract contract Auction {
    // เจ้าของ
    address payable public owner;   
    // รายละเอียดสินค้า
    // ออกสอบแน่นอนการใช้งาน struct
    struct Product { 
        string Brand;
        string SerialNumber;
    }
    // สถานะการประมูล
    enum AuctionState { STARTED, ENDED, CANCELED } // STARTED = 0, ENDED = 1, CANCELED = 2 
    // cllient functions 

    // ยื่นประมูล | ส่งเงินมาด้วย
    // virtual fuction คือ function ที่สามารถ override ได้
    function bid() virtual external payable ;  // external เสียค่า gas ถูกกว่า public
    // ดูยอดเงินที่ประมูลของตัวเองและผู้อื่น
    // view คือ function เรียยดู state
    function getMyBid( address bidder) virtual external view returns (uint256);

    // owner functions เป็นคนควบคุมการประมูล
    
    // จบการประมูล
    function endAuction() virtual external;
    // ยกเลิกการประมูล
    function cancelAuction() virtual external;

    // shared functions 
    // payable ใช้สำหรับรับเงิน

    // ถอนเงินออกจาก contract
    function withdraw () virtual external;
    // ดูรายละเอียดสินค้า
    function getProductInfo() virtual external view returns (string memory, string memory); // ถ้ามีข้อมูลที่เราไม่รู้จัก เราสามารถใช้ string memory แทนได้
    
    // events 
    
    // มีการประมูล
    event BidEvent(address bidder , uint256 amount, uint256 timestamp); // (ตั้งตัวแปรผู้ประมูล = bidder , จำนวนเงินที่ประมูล = amount, เวลาที่ประมูล = timestamp)
    // จบการประมูล
    event EndAuctionEvent(address winner, uint256 amount, uint256 timestamp); // ( ตั้งตัวแปรผู้ชนะ = winner , จำนวนเงินที่ชนะ = amount, เวลาที่จบการประมูล = timestamp)
    // การยิกเลิกการประมูล
    event CancelAuctionEvent(string message, uint256 timestamp); // (ตั้งตัวแปรข้อความ = message , เวลาที่ยกเลิก = timestamp)
    // การถอนเงิน
    event WithdrawEvent(address withdrawer, uint256 amount, uint256 timestamp); // (ตั้งตัวแปรผู้ถอน = withdrawer , จำนวนเงินที่ถอน = amount, เวลาที่ถอน = timestamp)
}