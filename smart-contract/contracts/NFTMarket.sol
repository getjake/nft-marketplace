// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // ERC721URIStorage is the extended version of ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    uint[] marketItems; // access all items in the market.

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    function getMarketItem(uint256 marketItemId) public view returns (MarketItem memory) {
        return idToMarketItem[marketItemId];
    }

    // the owner to list the item to sell
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // seller
            payable(address(0)), // owner
            price
        );
        
        // Transfer token to contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }
    
    // the buyer to buy the NFT
    function createMarketSale(address nftContract, uint256 itemId) payable public {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        idToMarketItem[itemId].seller.transfer(msg.value); // transfers eth to seller.
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); // send NFT from this contract to buyer.
        idToMarketItem[itemId].owner = payable(msg.sender); // update local mapping.  
        _itemsSold.increment();
    }

    function fetchMarketItem(uint itemId) public view returns(MarketItem memory) {
        MarketItem memory item = idToMarketItem[itemId];
        return item;
    }

    // the unsold items
    function fetchMarketItems() public view returns(MarketItem[] memory) {
        uint itemCount = _itemIds.current(); // represents the total #
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); // declare an array that has the length of `unsoldItemCount`

        for(uint i=0; i < itemCount; i++) {
            if(idToMarketItem[i + 1].owner == address(0)) { // means it is unsold.
                uint currentId = idToMarketItem[i + 1].itemId; // also equals to `i + 1`
                MarketItem storage currentItem = idToMarketItem[currentId]; // why use `storage`
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // fetch the NFT I bought
    function fetchMyNFTs() public view returns(MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // How to check it is my NFTs
        // owner == msg.sender ??

        // Count the NFTs bought
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount); 

        for (uint i = 0; i < itemCount; i++ ) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = idToMarketItem[i + 1].itemId; 
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;

    }

}