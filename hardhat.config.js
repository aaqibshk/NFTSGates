require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
// const mnemonic = fs.readFileSync(".secret").toString().trim();

const keyData = fs.readFileSync('./p-key.txt', {
  encoding:'utf8', flag:'r'
})

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: { 
      url: "https://polygon-mumbai.infura.io/v3/124fdad4427b49eca13d1ca2f02aa4da",
      accounts: [keyData]
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/124fdad4427b49eca13d1ca2f02aa4da",
      accounts: [keyData],
      gas: 21000000,
      gasPrice: 50000000000
    },
    mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/124fdad4427b49eca13d1ca2f02aa4da",
      accounts: [keyData]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
