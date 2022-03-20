# NFT Marketplace

This is the NFT Marketplace that allows user to mint and sell their NFTs.

## Howto

### Deploy the smart contract

```bash
# Inside `smart-contract` folder  to install `hardhat`
cd ./smart-contract
yarn
touch .env  

# Edit `.env` to enter your private key and infura key here.
  INFURA_KEY=YOUR_INFURA_KEY
  PRIVATE_KEY=YOUR_PRIVATE_KEY

# Make sure the contract works well on the local testnet
npx hardhat test 

# Deploy the Contract on the BSC testnet
npx hardhat run --network bscTestnet scripts/deploy.js

# Remember the contract addresses shown on the screen.
```


## Frontend Deployment

Replace the contract addresses in `./frontend/config.js` with yours.

```
## Install `nextjs` and all the dependencies
yarn 

## Install vercel and upload your site to Vercel
yarn add vercel -g
npx vc 

```