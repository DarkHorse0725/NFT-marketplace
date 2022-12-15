import React from 'react';

import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import Wallet from '../components/Wallet';
import Footer from '../components/Footer';
import ModalMenu from '../components/Modal/ModalMenu';
import Scrollup from '../components/Scrollup';

const WalletConnect = () => {
    return (
        <div className="main">
            <Header />
            <Breadcrumb title="Wallet Connect" />
            <Wallet />
            <Footer />
            <ModalMenu />
            <Scrollup />
        </div>
    );
}

export default WalletConnect;