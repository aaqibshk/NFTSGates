// SPDX-License-Identifier:MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract SGMarket is ReentrancyGuard {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIds;
  Counters.Counter private _tokensSold;

  address payable owner;
  uint256 listingPrice = 0.045 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketToken {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping (uint256 => MarketToken) private idToMarketToken;

  event MarketTokenMinted(
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  // create nft item
  function makeMarketItem(address nftContract, uint tokenId, uint price) public payable nonReentrant {
    require(price > 0, 'Price must be atleast 1 wei');
    require(msg.value == listingPrice, 'Price must be equal to listing price');

    _tokenIds.increment();
    uint itemId = _tokenIds.current();
    idToMarketToken[itemId] = MarketToken(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price ,false);
    
    // transfer nft item
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketTokenMinted(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
  }

  // create nft item sale
  function createMarketSale(address nftContract, uint itemId) public payable nonReentrant {
    uint price = idToMarketToken[itemId].price;
    uint tokenId = idToMarketToken[itemId].tokenId;
    require(msg.value == price, 'Please submit the asking price in order to continue');
    // transfer amount to seller
    idToMarketToken[itemId].seller.transfer(msg.value);

    // transfer the token/nft from contract address to buyer
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

    idToMarketToken[itemId].owner = payable(msg.sender);
    idToMarketToken[itemId].sold = true;
    _tokensSold.increment();

    payable(owner).transfer(listingPrice);
  }

  // function to fetchMarketItems also return the number of unsold items 
  function fetchMarketItems() public view returns (MarketToken[] memory) {
    uint itemCount = _tokenIds.current();
    uint unsoldItemCount = _tokenIds.current() - _tokensSold.current();
    uint currentIndex = 0;

    // loop over the number of nft items created (not sold)
    MarketToken[] memory items = new MarketToken[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if(idToMarketToken[i+1].owner == address(0)) {
        uint currentId = i + 1;
        MarketToken storage currentItem = idToMarketToken[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  function fetchMyNFTs() public view returns (MarketToken[] memory) {
    uint totalItemCount = _tokenIds.current();
    
    // counter for each individual user
    uint itemCount = 0;
    uint currentIndex = 0;

    for(uint i = 0; i < totalItemCount; i++) {
      if(idToMarketToken[i+1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    // loop through the amount you have purchased with itemCount, check owner == msg.sender
     MarketToken[] memory items = new MarketToken[](itemCount);
     for (uint i = 0; i < totalItemCount; i++) {
      if(idToMarketToken[i + 1].owner == msg.sender) {
        uint currentId = idToMarketToken[i+1].itemId;

        MarketToken storage currentItem = idToMarketToken[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
     }
     return items;
  }

  // function for returning array of minted nfts
  function fetchItemsCreated() public view returns (MarketToken[] memory) {
    uint totalItemCount = _tokenIds.current();
    
    // counter for each individual user
    uint itemCount = 0;
    uint currentIndex = 0;

    for(uint i = 0; i < totalItemCount; i++) {
      if(idToMarketToken[i+1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    // loop through the amount you have purchased with itemCount, check owner == msg.sender
     MarketToken[] memory items = new MarketToken[](itemCount);
     for (uint i = 0; i < totalItemCount; i++) {
      if(idToMarketToken[i + 1].seller == msg.sender) {
        uint currentId = idToMarketToken[i+1].itemId;

        MarketToken storage currentItem = idToMarketToken[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
     }
     return items;
  }
}








