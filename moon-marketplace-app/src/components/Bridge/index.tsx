import React from "react";

const Bridge: React.FC = () => {
  return (
    <section className="">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7">
            {/* Intro */}
            <div className="intro text-center">
              <span>Bridge</span>
              <h3 className="mt-3 mb-0">Moons Bridge</h3>
              <p>
                This Marketplace is on Polygon network, Moons are on Arbitrum
                Nova. To use Moons on this Marketplace, you need bridge your
                Moons from Nova to Polygon.
              </p>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-9 mt-4">
            <p>Bridge Moons from Nova to Polygon: </p>
            <p>
              Send the Moons to the smart contract address below, the equivalent
              amount will be minted on Polygon network to the sender address.
            </p>
            <p className="text-white">
              0x0273d016067e74b0093A17503af05C5a88Ee5f8F
            </p>
            <p>Bridge Moons from Polygon back to Nova: </p>
            <p>
              Send the Polygon Moons to the smart contract address below and the
              equivalent will be sent to the sender address on Nova network.{" "}
            </p>
            <p className="text-white">
              0x0273d016067e74b0093A17503af05C5a88Ee5f8F
            </p>
            <p className="text-white">
              Minimum: 100 Moons
              <br /> Fee: 1%
              <br /> Time: ~60 seconds
            </p>
            <p className="text-white">Polygon Moons Contract Address:</p>
            <p className="text-white">
              0x0273d016067e74b0093A17503af05C5a88Ee5f8F
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bridge;
