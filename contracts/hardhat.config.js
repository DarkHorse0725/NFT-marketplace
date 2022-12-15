require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URI,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 600000000
    },
    polygon: {
      url: process.env.POLYGON_RPC_URI,
      chainId: 137,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 600000000
    },
    goerli: {
      url: process.env.GOERLI_RPC_URI,
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 600000000
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: 'ASNHJSJ14R6WMRISZJ5UMJ3B9PBHIWRM8J',
      polygon: 'ASNHJSJ14R6WMRISZJ5UMJ3B9PBHIWRM8J',
      goerli: '4TYZB3WZ95XFV7C73NP76PQ3GPGXJ6ZYYH'
    }
  }
};
