import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/evm-utils";
import { Skeleton } from "@mui/material";

import { Auction, ERC1155ABI, ERC721ABI, Token } from "../../contracts/config";
import { ethers } from "ethers";
import { cmpAddress, isEmpty } from "../../helpers/check";
import ModalAuction from "../Modal/ModalAuction";
import { getAddressAbb } from "../../helpers/convert";
import useTxLoading from "../../hooks/useTxLoading";
import useErrorNotification from "../../hooks/useErrorNotification";

const NETWORK_URL = "https://polygonscan.com/address/";

const ItemDetails: React.FC = () => {
  const { contractAddress, tokenId } = useParams();
  const [nftData, setNftData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const provider = useProvider();
  const { data: signer } = useSigner();
  const auctionContract = useContract({
    address: Auction.address[137],
    abi: Auction.abi,
    signerOrProvider: signer ?? provider,
  });
  const tokenContract = useContract({
    address: Token.address[137],
    abi: Token.abi,
    signerOrProvider: signer ?? provider,
  });
  const txLoading = useTxLoading();
  const errorNotification = useErrorNotification();
  const navigate = useNavigate();

  const closeHandler = () => {
    setOpen(false);
  };

  const putOnAuctionHandler = async (
    startingPrice: number,
    endingPrice: number,
    duration: number
  ) => {
    const nftType = nftData.contractType === "ERC721" ? 0 : 1;
    txLoading.setOpen(true);
    try {
      const nftContract = new ethers.Contract(
        contractAddress ?? "",
        nftType === 0 ? ERC721ABI : ERC1155ABI,
        signer ?? provider
      );
      const approveTx =
        nftType === 0
          ? await nftContract?.approve(
              Auction.address[137],
              ethers.BigNumber.from(tokenId)
            )
          : await nftContract?.setApprovalForAll(Auction.address[137], true);
      await approveTx.wait();

      const auctionTx = await auctionContract?.createAuction(
        ethers.BigNumber.from(tokenId),
        ethers.utils.parseEther(startingPrice.toString()),
        ethers.utils.parseEther(endingPrice.toString()),
        1,
        duration * 86400,
        address,
        contractAddress,
        nftType
      );
      await auctionTx.wait();
      setOpen(false);
      navigate("/myauctions");
    } catch (err) {
      const errForm = JSON.parse(JSON.stringify(err));
      errorNotification.setError(errForm.message ?? "");
    }
    txLoading.setOpen(false);
  };

  const sendBidHandler = async (price: number) => {
    txLoading.setOpen(true);
    try {
      const tokenContract = new ethers.Contract(
        Token.address[137],
        Token.abi,
        signer ?? provider
      );

      const currentBalance = await tokenContract?.balanceOf(address);
      if (ethers.utils.parseEther(price.toString()).gt(currentBalance)) {
        errorNotification.setError("Insufficient Moon");
        txLoading.setOpen(false);
        return;
      }

      const currentPrice = await auctionContract?.getCurrentPrice(
        contractAddress ?? "",
        ethers.BigNumber.from(tokenId)
      );
      if (ethers.utils.parseEther(price.toString()).lt(currentPrice)) {
        txLoading.setOpen(false);
        errorNotification.setError("Your offer is too low.");
        return;
      }
      const approveTx = await tokenContract?.approve(
        Auction.address[137],
        ethers.utils.parseEther(price.toString())
      );
      await approveTx.wait();

      const bidTx = await auctionContract?.bid(
        contractAddress ?? "",
        tokenId,
        ethers.utils.parseEther(price.toString())
      );
      await bidTx.wait();
      navigate("/auction");
      setOpen(false);
    } catch (err) {
      const errForm = JSON.parse(JSON.stringify(err));
      errorNotification.setError(errForm.message ?? "");
    }
    txLoading.setOpen(false);
  };

  const acceptBidHandler = async () => {
    txLoading.setOpen(true);
    try {
      const acceptTx = await auctionContract?.accept(
        contractAddress ?? "",
        tokenId,
        nftData.highestBid.applicant
      );
      await acceptTx.wait();
      navigate("/myavatars");
    } catch (err) {
      const errForm = JSON.parse(JSON.stringify(err));
      errorNotification.setError(errForm.message ?? "");
    }
    txLoading.setOpen(false);
  };

  const cancelBidHandler = async () => {
    txLoading.setOpen(true);
    try {
      const cancelTx = await auctionContract?.cancelAuction(
        contractAddress ?? "",
        tokenId
      );
      await cancelTx.wait();
      navigate("/myavatars");
    } catch (err) {
      const errForm = JSON.parse(JSON.stringify(err));
      errorNotification.setError(errForm.message ?? "");
    }
    txLoading.setOpen(false);
  };

  const itemTradeHandler = async () => {
    if (nftData.btnType === 1 || nftData.btnType == 2) setOpen(true);
    else if (nftData.btnType === 0) {
      cancelBidHandler();
    }
  };

  const getNftData = async () => {
    let genesis;
    try {
      await Moralis.start({
        apiKey: process.env.REACT_APP_MORALIS_API_KEY,
      });

      const data = await Moralis.EvmApi.nft.getNFTMetadata({
        address: contractAddress ?? "",
        tokenId: tokenId ?? "",
        chain: EvmChain.POLYGON,
      });
      genesis = {
        img: (data?.result.metadata?.image ?? "")
          .toString()
          .replace("ipfs://", "https://ipfs.io/ipfs/"),
        title: data?.result.metadata?.name ?? "",
        description: data?.result.metadata?.description ?? "",
        contractType: data?.result.contractType,
        owner: data?.result.ownerOf?.checksum,
        created: new Date(data?.result.lastTokenUriSync ?? "").toDateString(),
        isMine: cmpAddress(data?.result.ownerOf?.checksum ?? "", address ?? ""),
      };
    } catch (err) {
      return genesis;
    }

    try {
      const auction = await auctionContract?.getAuction(
        contractAddress ?? "",
        ethers.BigNumber.from(tokenId ?? "")
      );
      genesis = {
        ...genesis,
        isOnAuction: true,
        auction: {
          nftAddress: auction.nftAddress,
          nftType: auction.nftType,
          duration: auction.duration / 86400,
          endingPrice: parseFloat(
            ethers.utils.formatEther(auction.endingPrice)
          ),
          startingPrice: parseFloat(
            ethers.utils.formatEther(auction.startingPrice)
          ),
          owner: auction.seller,
          seller: auction.seller,
        },
        isMine: cmpAddress(auction.seller, address ?? ""),
        btnType: cmpAddress(auction.seller, address ?? "") ? 0 : 1,
      };
    } catch (err) {
      genesis = {
        ...genesis,
        isOnAuction: false,
        btnType: genesis.isMine ? 2 : 3,
      };
      return genesis;
    }

    try {
      const bids = await auctionContract?.getBids(
        contractAddress ?? "",
        ethers.BigNumber.from(tokenId ?? "")
      );
      const enoughBids = await Promise.all(
        bids.map(async (element: any) => {
          const balance = await tokenContract?.balanceOf(element.applicant);
          if (ethers.BigNumber.from(balance).gte(element.price)) {
            return {
              applicant: element.applicant,
              price: parseFloat(ethers.utils.formatEther(element.price)),
            };
          }
        })
      );
      genesis = {
        ...genesis,
        bids: enoughBids,
        highestBid: enoughBids.reduce(
          (prev: any, cur: any) => (prev.price >= cur.price ? prev : cur),
          { applicant: "", price: 0 }
        ),
      };
    } catch (err) {}
    return genesis;
  };

  useEffect(() => {
    setLoading(true);
    getNftData().then((res) => {
      setNftData(res);
      setLoading(false);
    });
  }, []);
  return (
    <section className="item-details-area">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-12 col-lg-5">
            <div className="item-info">
              <div className="item-thumb text-center">
                {loading ? (
                  <Skeleton
                    variant="rounded"
                    width={"100%"}
                    height={"400px"}
                    animation="wave"
                    sx={{ bgcolor: "#16151a" }}
                  ></Skeleton>
                ) : (
                  <img src={nftData.img} alt="" />
                )}
              </div>
              <div className="card no-hover countdown-times my-4">
                <div
                  className="countdown d-flex justify-content-center"
                  data-date={nftData.date}
                />
              </div>
              {/* Netstorm Tab */}
              <ul className="netstorm-tab nav nav-tabs" id="nav-tab">
                {!isEmpty(nftData.bids) ? (
                  <li>
                    <a
                      className="active"
                      id="nav-home-tab"
                      data-toggle="pill"
                      href="#nav-home"
                    >
                      <h5 className="m-0">Bids</h5>
                    </a>
                  </li>
                ) : null}
                <li>
                  <a
                    className={
                      nftData.bids && nftData.bids.length > 0 ? "" : "active"
                    }
                    id="nav-contact-tab"
                    data-toggle="pill"
                    href="#nav-contact"
                  >
                    <h5 className="m-0">Details</h5>
                  </a>
                </li>
              </ul>
              {/* Tab Content */}
              <div className="tab-content" id="nav-tabContent">
                {!isEmpty(nftData.bids) ? (
                  <div className="tab-pane fade show active" id="nav-home">
                    <ul className="list-unstyled">
                      {/* Single Tab List */}
                      {nftData.bids.map((item: any, idx: number) => {
                        return (
                          <li
                            key={`tdo_${idx}`}
                            className="single-tab-list d-flex align-items-center"
                          >
                            <p className="m-0">
                              Bid listed for <strong>{item.price} MOON</strong>{" "}
                              {item.time} <br />
                              by{" "}
                              <a href={`${NETWORK_URL}${item.applicant}`}>
                                {item.applicant}
                              </a>
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
                <div
                  className={
                    "tab-pane fade" +
                    (isEmpty(nftData.bids) ? " show active" : "")
                  }
                  id="nav-contact"
                >
                  {/* Single Tab List */}
                  <div className="owner-meta d-flex align-items-center mt-3">
                    {loading ? (
                      <Skeleton
                        variant="text"
                        width="70%"
                        sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                      ></Skeleton>
                    ) : (
                      <>
                        <span>Owner</span>
                        <a
                          className="owner d-flex align-items-center ml-2"
                          href={`${NETWORK_URL}${nftData.owner}`}
                        >
                          {nftData.owner}
                        </a>
                      </>
                    )}
                  </div>
                  {loading ? (
                    <Skeleton
                      variant="text"
                      width="50%"
                      sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                    ></Skeleton>
                  ) : (
                    <p className="mt-2">Created : {nftData.created}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            {/* Content */}
            <div className="content mt-5 mt-lg-0">
              {loading ? (
                <Skeleton
                  variant="text"
                  width="100%"
                  sx={{ fontSize: "48px", bgcolor: "#16151a" }}
                ></Skeleton>
              ) : (
                <h3 className="m-0">{nftData.title}</h3>
              )}
              {loading ? (
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height="200px"
                  sx={{ bgcolor: "#16151a" }}
                ></Skeleton>
              ) : (
                <p>{nftData.description}</p>
              )}
              {/* Owner */}
              <div className="owner d-flex align-items-center">
                {loading ? (
                  <Skeleton
                    variant="text"
                    width="70%"
                    sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                  ></Skeleton>
                ) : (
                  <>
                    <span>Owned By</span>
                    <a
                      className="owner-meta d-flex align-items-center ml-3"
                      href={`${NETWORK_URL}${nftData.owner}`}
                    >
                      {nftData.owner}
                      <h6 className="ml-2">{nftData.itemOwner}</h6>
                    </a>
                  </>
                )}
              </div>
              {/* Item Info List */}
              {nftData.isOnAuction && (
                <div className="item-info-list mt-4">
                  <ul className="list-unstyled">
                    <li className="d-flex justify-content-between">
                      <span>Starting Price</span>
                      {loading ? (
                        <Skeleton
                          variant="text"
                          width="100px"
                          sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                        ></Skeleton>
                      ) : (
                        <span>{nftData.auction?.startingPrice} MOON</span>
                      )}
                    </li>
                    <li className="d-flex justify-content-between">
                      <span>Ending Price</span>
                      {loading ? (
                        <Skeleton
                          variant="text"
                          width="100px"
                          sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                        ></Skeleton>
                      ) : (
                        <span>{nftData.auction?.endingPrice} MOON</span>
                      )}
                    </li>
                    <li className="d-flex justify-content-between">
                      <span>Duration </span>

                      {loading ? (
                        <Skeleton
                          variant="text"
                          width="100px"
                          sx={{ fontSize: "32px", bgcolor: "#16151a" }}
                        ></Skeleton>
                      ) : (
                        <span>{nftData.auction?.duration} Days</span>
                      )}
                    </li>
                  </ul>
                </div>
              )}
              {!isEmpty(nftData.bids) && !loading && (
                <div className="row items">
                  <div className="col-12 item px-lg-2">
                    <div className="card no-hover">
                      <h4 className="mt-0 mb-2">Highest Bid</h4>
                      <div className="price d-flex justify-content-between align-items-center">
                        <span>
                          {getAddressAbb(nftData.highestBid.applicant)}
                        </span>
                        <span>{nftData.highestBid.price} MOON</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="row">
                {!isEmpty(nftData.bids) && nftData.isMine && !loading && (
                  <button
                    className="d-block btn btn-bordered-white mt-4 w-100"
                    onClick={acceptBidHandler}
                  >
                    Accept Bid
                  </button>
                )}
                {!loading && (
                  <button
                    className={
                      "d-block btn btn-bordered-white mt-4 w-100" +
                      (!(nftData.btnType < 3 && nftData.btnType >= 0)
                        ? " disabled"
                        : "")
                    }
                    onClick={itemTradeHandler}
                  >
                    {nftData.btnType === 0
                      ? "Cancel Auction"
                      : nftData.btnType === 1
                      ? "Send a Bid"
                      : nftData.btnType === 2
                      ? "Put on Auction"
                      : "..."}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {nftData.btnType < 3 && (
        <ModalAuction
          open={open}
          onClose={closeHandler}
          type={nftData.btnType ?? 0}
          onSubmit={
            nftData.btnType === 0
              ? cancelBidHandler
              : nftData.btnType === 1
              ? sendBidHandler
              : putOnAuctionHandler
          }
        ></ModalAuction>
      )}
    </section>
  );
};

export default ItemDetails;
