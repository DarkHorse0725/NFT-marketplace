import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { redirect, Link } from "react-router-dom";
import logo from "../../assets/image/logo.png";
import BalanceChip from "../BalanceChip";

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const walletConnectHandler = () => {
    if (isConnected) disconnect();
  };
  return (
    <header id="header">
      {/* Navbar */}
      <nav
        data-aos="zoom-out"
        data-aos-delay={800}
        className="navbar navbar-expand"
      >
        <div className="container header">
          {/* Navbar Brand*/}
          <Link className="navbar-brand" to="/">
            <img
              className="navbar-brand-sticky"
              src={logo}
              alt="sticky brand-logo"
            />
          </Link>
          {/* Navbar */}
          <ul className="navbar-nav items mr-auto ml-4">
            <li className="nav-item dropdown">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link" to="/auction">
                Auction
              </Link>
            </li>
            {isConnected && (
              <li className="nav-item">
                <Link className="nav-link" to="/myavatars">
                  My Avatars
                </Link>
              </li>
            )}
            {isConnected && (
              <li className="nav-item dropdown">
                <Link className="nav-link" to="/myauctions">
                  My Auction
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav toggle ml-auto">
            <li className="nav-item">
              <a
                href="#"
                className="nav-link"
                data-toggle="modal"
                data-target="#menu"
              >
                <i className="fas fa-bars toggle-icon m-0" />
              </a>
            </li>
          </ul>
          {/* Navbar Action Button */}
          <ul>
            <BalanceChip></BalanceChip>
          </ul>
          <ul className="navbar-nav action">
            <li className="nav-item ml-3">
              <Link
                to={isConnected ? "" : "/wallet-connect"}
                onClick={() => walletConnectHandler()}
                className="btn ml-lg-auto btn-bordered-white"
              >
                <i className="icon-wallet mr-md-2" />
                {isConnected
                  ? address?.slice(0, 4) + "..." + address?.slice(-4)
                  : "Wallet Connect"}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
