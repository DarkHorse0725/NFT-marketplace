// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const MoonNFT = await hre.ethers.getContractFactory("MOONNFT");
  // const moonNFT = await MoonNFT.deploy("MOONNFT", "OTHERNFT", "https://ipfs.io/ipfs/");
  // await moonNFT.deployed();
  // console.log(
  //   `MoonNFT Contract Address: `, moonNFT.address
  // );

  // const MoonToken = await hre.ethers.getContractFactory("MOON");
  // const moonToken = await MoonToken.deploy();
  // await moonToken.deployed();
  // console.log(
  //   `MOON Contract Address: `, moonToken.address
  // );

  // const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  // const marketplace = await Marketplace.deploy("0xA46E5F6c4bA286e2bC234f2dd504f7d3D7418981", "0x7EBff70630E21e49fbe90C6F0A6BB98760543862", 100);
  // await marketplace.deployed();
  // console.log(
  //   `Marketplace Contract Address: `, marketplace.address
  // );

  const Auction = await hre.ethers.getContractFactory("SaleClockAuction");
  const auction = await Auction.deploy("0xA46E5F6c4bA286e2bC234f2dd504f7d3D7418981",  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", "0x0273d016067e74b0093A17503af05C5a88Ee5f8F", 500);
  await auction.deployed();
  console.log(
    `Auction Contract Address: `, auction.address
  );

  // const MultiNFT = await hre.ethers.getContractFactory("MultiNFT");
  // const multiNFT = await MultiNFT.deploy();
  // await multiNFT.deployed();
  // console.log(
  //   `MultiNFT Contract Address: `, multiNFT.address
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
