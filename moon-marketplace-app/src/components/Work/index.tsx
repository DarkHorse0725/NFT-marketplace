import React from "react";

const workData = [
  {
    icon: "icon-wallet",
    title: "Set up your wallet",
    text: "Start trading Reddit Avatars by selecting a wallet and connecting your account to this marketplace.",
  },
  {
    icon: "icon-bag",
    title: "Put on Auction",
    text: "After setting up your wallet, put your Reddit Avatars on the auction house with their price and duration.",
  },
  {
    icon: "icon-cloud-upload",
    title: "Bridge Moons",
    text: "This Marketplace is on Polygon, you need to bridge your Moons from Arbitrum Nova to Polygon in order to bid on auctions or bridge the Moons back to Nova after successfully selling your Avatar.",
  },
  {
    icon: "icon-drawer",
    title: "Bid on Reddit Avatars",
    text: "On the Auction house, select one of the Reddit Avatars and bid with high price to win the Reddit Avatars.",
  },
  {
    icon: "icon-grid",
    title: "Sell your Reddit Avatars",
    text: "Sell the auctioned Reddit Avatars by accepting one of the bids.",
  },
];

const Work = () => {
  return (
    <section className="work-area">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {/* Intro */}
            <div className="intro mb-4">
              <div className="intro-content">
                <span>How it Works</span>
                <h3 className="mt-3 mb-0">Trading Reddit Avatars</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="row items">
          {workData.map((item, idx) => {
            return (
              <div
                key={`wd_${idx}`}
                className="col-12 col-sm-6 col-lg-2-4 item"
              >
                {/* Single Work */}
                <div className="single-work">
                  <i className={`icons text-effect ${item.icon}`} />
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Work;
