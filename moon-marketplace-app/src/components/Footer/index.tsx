import React from "react";

const socialData = [
  {
    id: 1,
    link: "https://twitter.com/MoonsSwap",
    icon: "fab fa-twitter",
  },
  {
    id: 2,
    link: "https://t.me/RedditMoon",
    icon: "fab fa-telegram",
  },
  {
    id: 3,
    link: "https://www.moonsdust.com",
    icon: "fa fa-globe",
  },
  {
    id: 4,
    link: "https://github.com/MoonsDusts",
    icon: "fab fa-github",
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="footer-area">
      {/* Footer Top */}
      <div className="footer-top">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-6 col-lg-9 res-margin">
              {/* Footer Items */}
              <div className="footer-items">
                {/* Social Icons */}
                <div className="social-icons d-flex justify-content-center">
                  {socialData.map((item, idx) => {
                    return (
                      <a
                        key={`sd_${idx}`}
                        className={item.link}
                        href={item.link}
                      >
                        <i className={item.icon} />
                        <i className={item.icon} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {/* Copyright Area */}
              <div className="copyright-area d-flex flex-wrap justify-content-center text-center py-4">
                {/* Copyright Left */}
                <div className="copyright-left">
                  ©2022 MoonFinance, All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
