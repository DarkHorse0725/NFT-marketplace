import React from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Work from "../components/Work";
import Footer from "../components/Footer";
import ModalMenu from "../components/Modal/ModalMenu";
import Scrollup from "../components/Scrollup";

const Home = () => {
  return (
    <div className="main">
      <Header />
      <Hero />
      <Work />
      <Footer />
      <ModalMenu />
      <Scrollup />
    </div>
  );
};

export default Home;
