import { ethers } from 'ethers';
import Image from 'next';
import { useEffect, useState } from 'react';
import web3 from 'web3';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftmarketaddress, nftaddress } from '../config';

import NFT from '../src/artifacts/contracts/NFT.sol/NFT.json';
import Market from '../src/artifacts/contracts/NFTMarket.sol/NFTMarket.json';

// Consider the whole json file as the `NFT` or `Market`. The property inside the json is

export default function Home() {

  // state - NFTs
  
  const [nfts, setNfts] = useState([]);
  const [loaded, setLoaded] = useState('not-loaded');

  useEffect( () => {
    loadNfts();
  }, []);

  
  const loadNfts = async() => {
    // provider with metamask
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   cacheProvider: true,
    // });
    
    // const connection = await web3Modal.connect();
    // const provider = new ethers.providers.Web3Provider(connection);

    const mumbai_rpc = 'https://rpc-mumbai.maticvigil.com/'
    const provider = new ethers.providers.JsonRpcProvider(mumbai_rpc);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider); // initilize the web3 instance
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
    const data = await marketContract.fetchMarketItems(); // here went wrong
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri); // an HTTP GET
      let price = web3.utils.fromWei(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item;
    }))

    console.log('items: ', items);
    setNfts(items);
    setLoaded('loaded');

  };

  const buyNft = async(nft) => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    // market contract - ethers.Contract object.
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    // this nft price
    const price = web3.utils.toWei(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, { value: price });
    await transaction.wait();
    loadNfts();
  };

  if (loaded == 'loaded' && !nfts.length) return (
    <h1 className='p-20 text-2xl color-red'>No NFTs! </h1>
  )

  return (
    <div className='flex justify-center'>
      <div style={{ width: 900 }}>
        <div className='grid grid-cols-2 gap-4 pt-8'>
          {
            nfts.map((nft, i) => (
              <div key={i} className='border p-4 shadow'>
                <img src={nft.image} alt='nft-image' className='rounded' />
                <p className='text-2xl my-4 font-bold'>Price: {nft.price} </p>
                <button className='bg-green-600 text-white py-2 px-12 rounded' onClick={() => buyNft(nft)}>Buy NFT</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
