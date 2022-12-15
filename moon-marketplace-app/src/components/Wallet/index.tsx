import React from "react";
import { useConnect } from "wagmi";
import metamask from "../../assets/image/metamask.png";
import walletconnect from "../../assets/image/walletconnect.png";

const walletData = [
  {
    id: 1,
    img: metamask,
    title: "MetaMask",
    content:
      "A browser extension with great flexibility. The web's most popular wallet",
  },
  {
    id: 2,
    img: walletconnect,
    title: "WalletConnect",
    content:
      "Pair with Trust, Argent, MetaMask & more. Works from any browser, without an extension",
  },
];

const Wallet = () => {
  const { connectors, connect } = useConnect();
  const walletConnectionHandler = (walletId: number) => {
    connect({ connector: connectors[walletId], chainId: 137 });
  };
  return (
    <section className="wallet-connect-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7">
            {/* Intro */}
            <div className="intro text-center">
              <span>Wallet Connect</span>
              <h3 className="mt-3 mb-0">Connect your Wallet</h3>
              <p>
                Chose your preferred Web3 wallet to connect to Moon2NFT marketplace
              </p>
            </div>
          </div>
        </div>
        <div className="row justify-content-center items">
          {walletData.map((item, idx) => {
            return (
              <div key={`wd_${idx}`} className="col-12 col-md-6 col-lg-4 item">
                {/* Single Wallet */}
                <div className="card single-wallet">
                  <a
                    className="d-block text-center"
                    onClick={() => walletConnectionHandler(idx)}
                  >
                    <img className="avatar-lg" src={item.img} alt="" />
                    <h4 className="mb-0">{item.title}</h4>
                    <p>{item.content}</p>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Wallet;
