import React, { useState } from "react";
import { motion } from "framer-motion";
import AppButton from "../AppButton";
import { Arimo } from "next/font/google";
import { NFT } from "../NFTCard";
import SelectComponent from "../SelectComponent";
import InputLine from "../InputLine";
import toast from "react-hot-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { client, marketplaceAddr } from "@/utils/constants";

const arimo = Arimo({});

const BidModal = ({ nft, close }: { nft: NFT; close: any }) => {
  const [val, setval] = useState("");
  const numberDecimalRegex = /^[0-9]+(\.[0-9]*)?$/;
  const { signAndSubmitTransaction } = useWallet();

  const handleConfirmBid = async () => {
    if (!val) {
      toast.error("Price cannot be empty");
      return;
    }

    try {
      const priceInOctas = parseFloat(val) * 100000000;

      // Bypass type checking
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::bid`,
          functionArguments: [nft.id.toString(), priceInOctas.toString()],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("Bid for NFT successful!");
      close();
      setval("");
      // fetchUserNFTs();
    } catch (error) {
      console.error("Error bidding for NFT:", error);
      toast.error("Failed to bid for NFT.");
    }
  };
  return (
    <div className='w-[659px] h-[528px] flex flex-col items-center justify-around bg-appWhite bord rounded-[8px]'>
      <p className='text-2xl'>Bid NFt </p>
      <div className='flex flex-col items-start ~gap-2/5'>
        <p style={arimo.style} className='flex items-center font-bold'>
          ID:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.id}
          </span>
        </p>
        <p style={arimo.style} className='flex items-center font-bold'>
          Name:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.name}
          </span>
        </p>
        <p style={arimo.style} className='flex items-center font-bold'>
          Description:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.description}
          </span>
        </p>
        <p style={arimo.style} className='flex items-center font-bold'>
          Rarity:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.rarity.toString()}
          </span>
        </p>
        <p style={arimo.style} className='flex items-center font-bold'>
          Owner:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.owner}
          </span>
        </p>
        <div className='flex items-center'>
          <p className='~mr-2/5'>Price:</p>
          <InputLine
            styles={"w-20"}
            placeholder='0 APT'
            value={val}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newValue = e.target.value;
              if (numberDecimalRegex.test(newValue) || newValue.length == 0) {
                setval(newValue);
              }
            }}
            readOnly={false}
            type='string'
          />
        </div>
      </div>
      <div className='flex ~gap-5/20 items-center'>
        <AppButton
          title='Cancel'
          style={"bg-red-700 hover:text-red-700 hover:border-red-700"}
          action={() => close()}
        />
        <AppButton title='Bid' action={handleConfirmBid} />
      </div>
    </div>
  );
};

export default BidModal;
