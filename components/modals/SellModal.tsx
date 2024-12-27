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
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { fetchMarketPlace, fetchUserNfts } from "@/lib/slices/marketSlice";

const arimo = Arimo({});

const SellModal = ({ nft, close }: { nft: NFT; close: any }) => {
  const [val, setval] = useState("");
  const [bidEnabled, setBidEnabled] = useState(false);
  const numberDecimalRegex = /^[0-9]+(\.[0-9]*)?$/;
  const { account, signAndSubmitTransaction } = useWallet();
  const dispatch = useAppDispatch();
  const { filterBy } = useAppSelector((state) => state.utils);

  const handleConfirmListing = async () => {
    if (!val) {
      toast.error("Price cannot be empty");
      return;
    }

    try {
      const priceInOctas = parseFloat(val) * 100000000;

      // Bypass type checking
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::list_for_sale`,
          functionArguments: [
            nft.id.toString(),
            priceInOctas.toString(),
            bidEnabled,
          ],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("NFT listed for sale successfully!");
      close();
      setval("");
      dispatch(fetchUserNfts({ account, filterBy }));
      dispatch(fetchMarketPlace());

      // router.refresh();
    } catch (error) {
      console.error("Error listing NFT for sale:", error);
      toast.error("Failed to list NFT for sale.");
    }
  };
  return (
    <div className='w-[659px] h-[528px] flex flex-col items-center justify-around bg-appWhite bord rounded-[8px]'>
      <p className='text-2xl'>List NFt for sale</p>
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
        <div className='flex items-center'>
          <p className='~mr-2/5'>Enable Bid:</p>
          <SelectComponent
            placeholder='False'
            onChange={(item: any) => setBidEnabled(Boolean(item))}
            items={["True", "False "]}
          />
        </div>
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
        <AppButton title='Confirm' action={handleConfirmListing} />
      </div>
    </div>
  );
};

export default SellModal;
