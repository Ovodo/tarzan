import { motion } from "framer-motion";
import { Arimo } from "next/font/google";
import { useState } from "react";
import AppButton from "../AppButton";
import { NFT } from "../NFTCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { client, marketplaceAddr } from "@/utils/constants";
import toast from "react-hot-toast";
import { fetchMarketPlace, fetchUserNfts } from "@/lib/slices/marketSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hook";

const arimo = Arimo({});

const PurchaseModal = ({ nft, close }: { nft: NFT; close: any }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const { filterBy } = useAppSelector((state) => state.utils);
  const dispatch = useAppDispatch();

  const handleConfirmPurchase = async () => {
    const priceInOctas = nft.price * 100000000;

    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::purchase_nft`,
          functionArguments: [nft.id.toString(), priceInOctas.toString()],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("NFT purchased successfully!");
      close();
      dispatch(fetchUserNfts({ account, filterBy }));
      dispatch(fetchMarketPlace());
    } catch (error) {
      console.error("Error purchasing NFT :", error);
      toast.error("Failed to purchase");
    }
  };

  return (
    <div className='w-[659px] h-[528px] flex flex-col items-center justify-around bg-appWhite bord rounded-[8px]'>
      <p className='text-2xl'>Purchase NFt </p>
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
          Price:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.price}
          </span>
        </p>
        <p style={arimo.style} className='flex items-center font-bold'>
          Owner:{" "}
          <span style={arimo.style} className='font-normal ml-1'>
            {nft.owner}
          </span>
        </p>
      </div>
      <div className='flex ~gap-5/20 items-center'>
        <AppButton
          title='Cancel'
          style={"bg-red-700 hover:text-red-700 hover:border-red-700"}
          action={() => close()}
        />
        <AppButton title='Confirm' action={handleConfirmPurchase} />
      </div>
    </div>
  );
};

export default PurchaseModal;
