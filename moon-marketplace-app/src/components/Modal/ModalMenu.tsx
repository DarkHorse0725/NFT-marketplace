import React from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

const ModalMenu: React.FC = () => {
  const { isConnected } = useAccount();
  return (
    <div id="menu" className="modal fade p-0">
      <div className="modal-dialog dialog-animated">
        <div className="modal-content h-100">
          <div className="modal-header" data-dismiss="modal">
            Menu <i className="far fa-times-circle icon-close" />
          </div>
          <div className="menu modal-body">
            <div className="row w-100">
              <div className="items p-0 col-12 text-center">
                <ul className="navbar-nav items mx-auto">
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
                  {isConnected && (
                    <li className="nav-item dropdown">
                      <Link className="nav-link" to="/bridge">
                        Moons Bridge
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMenu;
