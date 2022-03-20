require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [ process.env.PRIVATE_KEY ]
    },
    ganache: {
      url: 'HTTP://127.0.0.1:7545',
      accounts: ['0x54b709072a939a81c9480d1af01b823519cdf95a1edf1cf2068569d768786754'],
      chainId: 1337
    }
  }
};