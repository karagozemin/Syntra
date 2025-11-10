const path = require("path");
// Load .env located at agentx/.env (one level up from packages)
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology/";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    polygon_amoy: {
      chainId: 80002,
      url: POLYGON_RPC_URL,
      accounts,
      timeout: 120000,
      // Gas price otomatik hesaplanacak (çok daha ucuz)
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
};

module.exports = config;


