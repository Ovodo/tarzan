"use client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "aptos";
import { Alkatra } from "next/font/google";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import TopMenu from "./TopMenu";
import StoreProvider from "./StoreProvider";

const wallets = [new PetraWallet()];

const alkatra = Alkatra({});

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <body
      style={alkatra.style}
      className={`w-screen ~pb-4/8 min-h-screen overflow-y-scroll bg-gradient-to-br from-[#191919]  to-[#1F211C] antialiased`}
    >
      <StoreProvider>
        <AptosWalletAdapterProvider
          dappConfig={{ network: Network.DEVNET }}
          plugins={wallets}
          // autoConnect={true}
        >
          <Navbar />
          <TopMenu />

          {children}
          <Toaster />
        </AptosWalletAdapterProvider>
      </StoreProvider>
    </body>
  );
};

export default Provider;
