const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Moon = await ethers.getContractFactory("MOON");
    const moon = await Moon.deploy();
    await moon.deployed();

    console.log('Moon contract address: ', moon.address);

    const MoonNFT = await ethers.getContractFactory("MoonNFT");
    const moonNFT = await MoonNFT.deploy("MoonNFT", "MoonNFT", "https://ipfs.io/ipfs/");
    await moonNFT.deployed();

    console.log('MoonNFT contract address: ', moonNFT.address);

    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(moonNFT.address, moon.address, 100);
    await marketplace.deployed();

    console.log('Marketplace contract address: ', marketplace.address);

    const Auction = await ethers.getContractFactory("SaleClockAuction");
    const auction = await Auction.deploy(moonNFT.address, moon.address, moon.address, 12);
    await auction.deployed();

    console.log('Auction contract address: ', auction.address);

    return { moon, moonNFT, auction, marketplace,  owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const {moon, moonNFT, auction, owner, otherAccount, marketplace} = await deploy()
      await auction.connect(owner).setFeeAddress(owner.address)
      await moonNFT.connect(owner).grantRole(await moonNFT.MINTER_ROLE(), marketplace.address)
      await moon.connect(owner).transfer(otherAccount.address, ethers.BigNumber.from(10).pow(18).mul(100000));

      await marketplace.connect(owner).addNewProduction("1", "1", 100, 10, "1");
      await marketplace.connect(owner).addNewProduction("2", "2", 200, 10, "2");
      await marketplace.connect(owner).addNewProduction("3", "3", 300, 10, "3");

      await moon.connect(owner).approve(marketplace.address, ethers.BigNumber.from(10).pow(18).mul(100));
      await marketplace.connect(owner).buy(owner.address, "1", ethers.BigNumber.from(10).pow(18).mul(100));

      await moonNFT.connect(owner).approve(auction.address, 0);
      await auction.connect(owner).createAuction(0, ethers.BigNumber.from(10).pow(18).mul(10), ethers.BigNumber.from(10).pow(18).mul(100), 1, 86400, owner.address, moonNFT.address)

      await moon.connect(otherAccount).approve(auction.address, ethers.BigNumber.from(10).pow(18).mul(100));
      await auction.connect(otherAccount).bid(moonNFT.address, 0, ethers.BigNumber.from(10).pow(18).mul(100));

      await auction.connect(owner).accept(moonNFT.address, 0, otherAccount.address)
    });
  });
});
