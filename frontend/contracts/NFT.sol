// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // ERC721URIStorage is the extended version of ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {

    // using for syntax: https://itnext.io/libraries-and-using-for-in-solidity-5c954da04128
    // `Counters.Counter` will have the property of `Counters`
    using Counters for Counters.Counter; 
    Counters.Counter private _tokenIds;
    // _tokenIds.increment()
    address contractAddress; // this is the marketplaceAddress

    constructor(address marketplaceAddress) ERC721("Jake NFTs", "JFT") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns(uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current(); 

        _mint(msg.sender, newItemId); // from ERC721 function
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true); // Allow this contract to transfer all the NFTs
        return newItemId;
    }
}
