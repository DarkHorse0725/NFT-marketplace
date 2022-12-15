import React, { useState, useEffect } from "react";
import { useContract, useProvider } from "wagmi";
import axios from "axios";

import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import LiveAuctions from "../components/Auctions";
import Footer from "../components/Footer";
import ModalMenu from "../components/Modal/ModalMenu";
import Scrollup from "../components/Scrollup";

import { Auction, ERC1155ABI, ERC721ABI } from "../contracts/config";
import { ethers } from "ethers";

const Auctions = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const provider = useProvider();
  const auctionContract = useContract({
    address: Auction.address[137],
    abi: Auction.abi,
    signerOrProvider: provider,
  });

  const getAuctions = async () => {
    const results: any[] = [];
    try {
      const allContracts = await auctionContract?.getAllNFTAddress();
      await Promise.all(
        allContracts.map(async (contract: string) => {
          const ids = await auctionContract?.getIdsAuction(contract);

          await Promise.all(
            ids.map(async (tokenId: any) => {
              const auction = await auctionContract?.getAuction(
                contract,
                tokenId
              );
              const nftContract = new ethers.Contract(
                contract,
                auction.nftType === 0 ? ERC721ABI : ERC1155ABI,
                provider
              );
              let tokenURI;
              if (auction.nftType === 0) {
                tokenURI = await nftContract?.tokenURI(tokenId);
              } else if (auction.nftType === 1) {
                tokenURI = await nftContract?.uri(tokenId);
                tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
              }
              const ipfsData = await axios
                .get(tokenURI)
                .then((res) => res.data);
              results.push({
                id: tokenId.toString(),
                img: ipfsData.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                title: ipfsData.name,
                description: ipfsData.description,
                address: auction.seller,
                price: parseFloat(
                  ethers.utils.formatEther(auction.startingPrice)
                ),
                startingPrice: parseFloat(
                  ethers.utils.formatEther(auction.startingPrice)
                ),
                endingPrice: parseFloat(
                  ethers.utils.formatEther(auction.endingPrice)
                ),
                startedAt: auction.startedAt,
                duration: auction.duration.toString(),
                nftAddress: auction.nftAddress,
                isAuction: true,
              });
            })
          );
        })
      );
    } catch (err) {}
    return results;
  };
  useEffect(() => {
    setLoading(true);
    getAuctions().then((res) => {
      setAuctions(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="main">
      <Header />
      <Breadcrumb title="Auctions" />
      <LiveAuctions
        auctions={auctions}
        loading={loading}
        heading="Live Auction"
        subheading="Explore and browse Live Auctions of Reddit Avatars. Discover
                Avatar’s details and their auction statistics like Duration,
                Initial/Final Price and the current bids."
      />
      <Footer />
      <ModalMenu />
      <Scrollup />
    </div>
  );
};

export default Auctions;
