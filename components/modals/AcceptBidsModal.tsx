import React, { useState } from "react";
import { motion } from "framer-motion";
import AppButton from "../AppButton";
import { Arimo } from "next/font/google";
import { NFT } from "../NFTCard";
import SelectComponent from "../SelectComponent";
import InputLine from "../InputLine";
import { client, marketplaceAddr } from "@/utils/constants";
import toast from "react-hot-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const arimo = Arimo({});

const AcceptBidsModal = ({ nft, close }: { nft: NFT; close: any }) => {
  const { signAndSubmitTransaction } = useWallet();
  console.log(nft);

  function truncateAptosAddress(address: string, length: number = 6) {
    if (
      !address ||
      typeof address !== "string" ||
      address.length <= 2 * length
    ) {
      return address; // Return as is if the address is too short to truncate
    }
    const start = address.slice(0, length);
    const end = address.slice(-length);
    return `${start}...${end}`;
  }

  const acceptBid = async (winner: string) => {
    try {
      // Bypass type checking
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::select_bid_winner`,
          functionArguments: [nft.id.toString(), winner],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("Bid Acceoted!");
      close();
      // fetchUserNFTs();
    } catch (error) {
      console.error("Error accepting NFT:", error);
      toast.error("Failed to accept bid for NFT.");
    }
  };

  return (
    <div className='w-[659px] h-[528px] flex flex-col items-center justify-around bg-appWhite bord rounded-[8px]'>
      <p className='text-2xl'>{`Bids for NFT with id ${nft.id}`} </p>
      <div className='flex flex-col h-[70%] w-full items-start ~gap-2/5'>
        <div className='w-full flex flex-col overflow-y-scroll items-center ~gap-2/4 h-[95%]'>
          {nft.bids.map((item, index) => (
            <div
              key={index.toString()}
              className='grid w-[80%] mx-auto  grid-cols-[3fr,1fr,1.5fr]'
            >
              <p className='' style={arimo.style}>
                {truncateAptosAddress(item.key as unknown as string)}
              </p>
              <p className='' style={arimo.style}>
                {item.value / 100000000} APT
              </p>
              <div className=' flex justify-end'>
                <AppButton
                  title={`${
                    nft.bid_winner == item.key.toString() ? "Won" : "Accept"
                  }`}
                  style={`${
                    nft.bid_winner == item.key.toString()
                      ? "bg-appGreen text-slate-700"
                      : ""
                  }`}
                  action={
                    nft.bid_winner !== item.key.toString()
                      ? () => acceptBid(item.key as unknown as string)
                      : () => {
                          toast.success("Winner selected already");
                        }
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='flex ~gap-5/20 items-center'>
        <AppButton
          title='Cancel'
          style={"bg-red-700 hover:text-red-700 hover:border-red-700"}
          action={() => close()}
        />
      </div>
    </div>
  );
};

export default AcceptBidsModal;
