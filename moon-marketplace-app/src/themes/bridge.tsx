import React from "react";

import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Bridge from "../components/Bridge";
import Footer from "../components/Footer";
import ModalMenu from "../components/Modal/ModalMenu";
import Scrollup from "../components/Scrollup";

const MoonsBridge = () => {
  return (
    <div className="main">
      <Header />
      <Breadcrumb title="Moons Bridge" subpage="Bridge" page="Moons Bridge" />
      <Bridge></Bridge>
      <Footer />
      <ModalMenu />
      <Scrollup />
    </div>
  );
};

export default MoonsBridge;
