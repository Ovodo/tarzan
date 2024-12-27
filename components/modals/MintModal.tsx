import React, { useState } from "react";
import { motion } from "framer-motion";
import AppButton from "../AppButton";
import { Arimo } from "next/font/google";
import { NFT } from "../NFTCard";
import SelectComponent from "../SelectComponent";
import InputLine from "../InputLine";
import toast from "react-hot-toast";
import { client, marketplaceAddr } from "@/utils/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { fetchMarketPlace } from "@/lib/slices/marketSlice";
import { useAppDispatch } from "@/lib/hook";

const arimo = Arimo({});

const MintModal = ({ close }: { close: any }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uri, setUri] = useState("");
  const [rarity, setRarity] = useState("Bronze");
  const { signAndSubmitTransaction } = useWallet();
  const dispatch = useAppDispatch();

  const handleMintNFT = async () => {
    if (!name || !description || !uri) {
      toast.error("Please fill out all required fields before submitting.");
      return;
    }
    try {
      const nameVector = Array.from(new TextEncoder().encode(name));
      const descriptionVector = Array.from(
        new TextEncoder().encode(description)
      );
      const uriVector = Array.from(new TextEncoder().encode(uri));
      const u8Rarity =
        rarity == "Gold"
          ? 0
          : rarity == "Silver"
          ? 1
          : rarity === "Bronze"
          ? 2
          : 2;
      const txnResponse = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::mint_nft`,
          functionArguments: [
            nameVector,
            descriptionVector,
            uriVector,
            u8Rarity,
          ],
        },
      });
      await client.waitForTransaction(txnResponse.hash);

      toast.success("NFT minted successfully!");
      dispatch(fetchMarketPlace());
      close();
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT.");
    }
  };

  return (
    <div className='w-[659px] h-[528px] flex ~px-2/5 ~py-2/4 flex-col items-center justify-around bg-appWhite bord rounded-[8px]'>
      <p className='text-2xl'>Mint NFT</p>
      <div className='flex flex-col w-full items-start ~gap-2/4'>
        <div className='flex w-full items-start flex-col '>
          <p className='~mr-2/5'>Name:</p>
          <InputLine
            styles={"w-full border-2 rounded-md"}
            placeholder='Unchained Parcel'
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
            }}
            readOnly={false}
            type='string'
          />
        </div>
        <div className='flex w-full items-start flex-col '>
          <p className='~mr-2/5'>Description:</p>
          <InputLine
            styles={"w-full border-2 rounded-md"}
            placeholder='Into the badlands was a furious and dangerous monster'
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDescription(e.target.value);
            }}
            readOnly={false}
            type='string'
          />
        </div>
        <div className='flex w-full items-start flex-col '>
          <p className='~mr-2/5'>Url:</p>
          <InputLine
            styles={"w-full border-2 rounded-md"}
            placeholder='https://www.exampleuri.com/5/dkskls/'
            value={uri}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUri(e.target.value);
            }}
            readOnly={false}
            type='string'
          />
        </div>
        <div className='flex flex-col items-start'>
          <p className='~mr-2/5'>Rarity:</p>
          <SelectComponent
            placeholder='Bronze'
            onChange={(item: any) => setRarity(item)}
            items={["Gold", "Silver", "Bronze"]}
          />
        </div>
      </div>
      <div className='flex ~gap-5/20 items-center'>
        <AppButton
          title='Cancel'
          style={"bg-red-700 hover:text-red-700 hover:border-red-700"}
          action={() => close()}
        />
        <AppButton title='Confirm' action={handleMintNFT} />
      </div>
    </div>
  );
};

export default MintModal;
