const axios = require('axios');
const { ethers } = require('hardhat');
const { expect } = require("chai");

describe("NFTMarket", () => {

    it('should interact with the token contract', async () => {
        const [ deployer, user1, user2, user3 ] = await ethers.getSigners();
        // the default account is deployer

        const Market = await ethers.getContractFactory("NFTMarket");
        const market = await Market.deploy();
        marketAddress = market.address;

        const NFT = await ethers.getContractFactory("NFT");
        const nft = await NFT.deploy(marketAddress);
        nftContractAddress = nft.address;
        
        let allItems;
        let itemsOnMarket;

        // create nft using user1
        await nft.connect(user1).createToken("a");
        await nft.connect(user1).createToken("b");
        await nft.connect(user1).createToken("c");

        // put them on market
        await market.connect(user1).createMarketItem(nftContractAddress, 1, 1000);
        await market.connect(user1).createMarketItem(nftContractAddress, 2, 2000);
        await market.connect(user1).createMarketItem(nftContractAddress, 3, 3000);

        allItems = await market.fetchMarketItems();

        allItems = await Promise.all(
            allItems.map( async i => {
                const tokenUri = await nft.tokenURI(i.tokenId);
                let item = {
                    price: i.price.toNumber(),
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri: tokenUri
                }
                return item

            })
        )
        console.log('all items: ', allItems);





        // buy the tokens
        // user2 got first 2, and user3 got the 3rd one.
        await market.connect(user2).createMarketSale(nftContractAddress, 1, { value: 1000 });
        itemsOnMarket = (await market.fetchMarketItems()).length;
        expect(itemsOnMarket).to.equal(2); // 2 items unsold.
        await market.connect(user2).createMarketSale(nftContractAddress, 2, { value: 2000 });
        await market.connect(user3).createMarketSale(nftContractAddress, 3, { value: 3000 });
        expect((await market.fetchMarketItems()).length).to.equal(0);
        
        itemsOfUser2 = await market.connect(user2).fetchMyNFTs();
        console.log('item of user2: ', itemsOfUser2);
    });
});