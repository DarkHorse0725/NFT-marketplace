import React from "react";

import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import ItemDetail from "../components/ItemDetails";
import Footer from "../components/Footer";
import ModalMenu from "../components/Modal/ModalMenu";
import Scrollup from "../components/Scrollup";

const ItemDetails: React.FC = () => {
  return (
    <div className="main">
      <Header />
      <Breadcrumb title="Item Details" subpage="Explore" page="Item Details" />
      <ItemDetail />
      <Footer />
      <ModalMenu />
      <Scrollup />
    </div>
  );
};

export default ItemDetails;
