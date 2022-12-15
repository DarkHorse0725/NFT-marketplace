import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { SlideDown } from "react-slidedown";

import { getAddressAbb, getOwnerText } from "../../helpers/convert";
import { isEmpty } from "../../helpers/check";

const NETWORK_URL = "https://polygonscan.com/address/";

interface Props {
  nfts?: any[];
  loading?: boolean;
}

const Explore: React.FC<Props> = (props) => {
  const [search, setSearch] = useState("");
  const { address } = useAccount();
  const [page, setPage] = useState(4);

  const loadMoreHandler = () => {
    setPage(page + 4);
  };

  const searchHandler = (e: any) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const filterData = (data: any[]) => {
    return data.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <section className="explore-area load-more">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7">
            {/* Intro */}
            <div className="intro text-center">
              <span>Explore</span>
              <h3 className="mt-3 mb-0">Reddit Digital Collectibles</h3>
              <p>
                Here you can browse Reddit Avatars you've already acquired,
                which should also be visible in your Reddit Vault ,MetaMask or
                Trust Wallet.
              </p>
            </div>
          </div>
        </div>
        <div className="row justify-content-end mb-4">
          <div className="col-md-4 col-sm-6 col-xs-12 mt-4 mt-sm-0">
            <input
              type="text"
              className="rounded-pill px-4 border-white"
              placeholder="Search..."
              value={search}
              onChange={searchHandler}
            />
          </div>
        </div>
        {props.loading ? (
          <div className="row justify-content-center">
            <CircularProgress color="inherit" size={80}></CircularProgress>
          </div>
        ) : (
          <>
            <div className="row items">
              {props.nfts &&
                filterData(props?.nfts)
                  .slice(0, page)
                  .map((item: any, idx: number) => {
                    return (
                      <div
                        key={`exf_${idx}`}
                        className="col-12 col-sm-6 col-lg-3 item"
                      >
                        <SlideDown>
                          <div className="card">
                            <div className="image-over">
                              <Link
                                to={`/item-details/${item.contractAddress}/${item.id}`}
                              >
                                <img
                                  className="card-img-top"
                                  src={item.img}
                                  alt=""
                                />
                              </Link>
                            </div>
                            {/* Card Caption */}
                            <div className="card-caption col-12 p-0">
                              {/* Card Body */}
                              <div className="card-body">
                                <Link
                                  to={`/item-details/${item.contractAddress}/${item.id}`}
                                >
                                  <h5 className="mb-0">{item.title}</h5>
                                </Link>
                                <div className="seller d-flex align-items-center my-3">
                                  <span>Owned By</span>
                                  <a
                                    href={`${NETWORK_URL}${item.owner}`}
                                    target="_blank"
                                  >
                                    <h6 className="ml-2 mb-0">
                                      {getOwnerText(item.owner, address ?? "")}
                                    </h6>
                                  </a>
                                </div>
                                <div className="card-bottom d-flex justify-content-between">
                                  <span>{item.price}</span>
                                  <span>{item.count}</span>
                                </div>
                                <Link
                                  className="btn btn-bordered-white btn-smaller mt-3"
                                  to={`/item-details/${item.contractAddress}/${item.id}`}
                                >
                                  <i className="icon-handbag mr-2" />
                                  Put on Auction
                                </Link>
                              </div>
                            </div>
                          </div>
                        </SlideDown>
                      </div>
                    );
                  })}
            </div>
            {props.nfts && filterData(props.nfts).length > page && (
              <div className="row">
                <div className="col-12 text-center">
                  <button
                    id="load-btn"
                    className={"btn btn-bordered-white mt-5"}
                    onClick={loadMoreHandler}
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Explore;
