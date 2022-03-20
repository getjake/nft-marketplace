import { useState } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
// import Image from 'next/image';
import Web3Modal from 'web3modal';
import web3 from 'web3';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../src/artifacts/contracts/NFT.sol/NFT.json';
import Market from '../src/artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function Home() {
    const [fileUrl, setFileUrl] = useState(null); // the current file uploaded => 2 files: image and json to ipfs
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''});
    const router = useRouter();

    const createSale = async (url) => {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        });
        const connection = await web3Modal.connect(); // connect to metamask
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait(); // tx result
        let event = tx.events[0];
        let value = event.args[2];
        let tokenId = value.toNumber();
        const price = web3.utils.toWei(formInput.price, 'ether');
        const listingFee = web3.utils.toWei('0.1', 'ether'); // 上架费用

        // nftMarketContract
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingFee });
        await transaction.wait();
        router.push('/'); // Go back to homepage
    };

    const onChange = async(e) => {
        const file = e.target.files[0];
        try {
            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`)
            })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
            console.log('NFT Image uploaded to: ', url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    const createMarket = async () => {
        const { name, description, price } = formInput
        console.log("before create...")
        if( !name || !description || !price || !fileUrl ) return

        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        console.log("creating...")
        try {
            const added = await client.add(data) // update json-string to ipfs
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url);
        } catch (error) {
            console.log('Error uploading file: ', error);
        }
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input 
                    placeholder="NFT Name" 
                    className="mt-8 border rounded p-4" 
                    onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <input 
                    placeholder="NFT Description" 
                    className="mt-8 border rounded p-4" 
                    onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input 
                    placeholder="NFT Price in Eth" 
                    className="mt-8 border rounded p-4" 
                    onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input 
                    type="file"
                    name="NFT"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileUrl && ( <img className='rounded mt-4' alt='nft-image' width='350' src={fileUrl}/>)
                }
                <button onClick={createMarket} className='mt-4 bg-blue-500 text-white rounded p-4 shadow-lg'>
                    Create NFT
                </button>
                
            </div>
        </div>
    )
}