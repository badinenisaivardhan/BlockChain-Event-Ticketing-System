require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
      sepolia: {
        url: String(process.env.WEB_URL),
        accounts: [`0x${process.env.PRIVATE_KEY}`]
      }
  }
};