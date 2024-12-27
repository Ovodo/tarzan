"use client";
import Image from "next/image";
import AppButton from "./AppButton";
import { Star } from "tabler-icons-react";
import { use, useEffect, useState } from "react";
import ModalComponent from "./modals/ModalComponent";
import SellModal from "./modals/SellModal";
import MintModal from "./modals/MintModal";
import PurchaseModal from "./modals/PurchaseModal";
import BidModal from "./modals/BidModal";
import AcceptBidsModal from "./modals/AcceptBidsModal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { HexString } from "aptos";
import { Hex } from "@aptos-labs/ts-sdk";
import { client, marketplaceAddr } from "@/utils/constants";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { fetchMarketPlace, fetchUserNfts } from "@/lib/slices/marketSlice";

export type NFT = {
  id: number;
  name: string;
  description: string;
  uri: string;
  price: number;
  owner: string;
  bid_enabled: boolean;
  bids: Record<string, number>[];
  bid_winner: string;
  for_sale: boolean;
  rarity: number;
  min: number;
  max: number;
};

const NFTCard = ({ item }: { item: NFT }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [bidsmodalOpen, setBidsModalOpen] = useState(false);
  const [userBidPrice, setUserBidPrice] = useState(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const { account, signAndSubmitTransaction } = useWallet();
  const { filterBy } = useAppSelector((state) => state.utils);

  const path = usePathname();
  const dispatch = useAppDispatch();
  console.log(item);
  const bidList = item.bids
    ? item?.bids?.map((item) => item.key.toString())
    : [];

  const isOwner =
    item.owner ==
    HexString.ensure((account?.address as string) ?? "").toShortString();

  const isBidder = bidList.includes(
    HexString.ensure((account?.address as string) ?? "").toShortString()
  );

  const isBidWinner =
    item.bid_winner ==
    HexString.ensure((account?.address as string) ?? "").toShortString();

  const rarity =
    item.rarity === 0
      ? "Gold"
      : item.rarity === 1
      ? "Silver"
      : item.rarity === 2
      ? "Bronze"
      : "Bronze"; // Default case

  const handleAddToFavourites = async () => {
    try {
      // Bypass type checking
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::toggle_favourites`,
          functionArguments: [item.id.toString()],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("Added to Favourites!");
      getFavouritesNfts();
      close();
      dispatch(fetchUserNfts({ account, filterBy }));
    } catch (error) {
      console.error("Error adding to Favourites :", error);
      toast.error("Failed to add to Favourites");
    }
  };
  const handleConfirmDeListing = async () => {
    try {
      // Bypass type checking
      const response = await signAndSubmitTransaction({
        data: {
          function: `${marketplaceAddr}::Tarzan::delist_from_sale`,
          functionArguments: [item.id.toString()],
        },
      });
      await client.waitForTransaction(response.hash);

      toast.success("NFT delisted  successfully!");
      close();
      dispatch(fetchUserNfts({ account, filterBy }));
      dispatch(fetchMarketPlace());
    } catch (error) {
      console.error("Error delisting NFT :", error);
      toast.error("Failed to delist");
    }
  };

  const getFavouritesNfts = async () => {
    if (!account) return;
    item.bids?.forEach((item) => {
      if (
        item.key.toString() ==
        HexString.ensure((account?.address as string) ?? "").toShortString()
      ) {
        setUserBidPrice(item.value / 100000000);
      }
    });

    try {
      const res: any = (
        await client.view({
          function: `${marketplaceAddr}::Tarzan::get_nfts_by_favourites`,
          arguments: [account.address],
          type_arguments: [],
        })
      )[0];
      setFavourites(res);
    } catch (error) {
      console.error("error fetching favs", error);
    }
  };
  console.log(path);

  useEffect(() => {
    getFavouritesNfts();
  }, [account, filterBy]);
  return (
    <div className='w-[350px] relative h-[352px] bg-appWhite hover:shadow-[_4px_4px_4px] hover:cursor-pointer duration-300 hover:-translate-y-1 hover:shadow-appWhite/25 rounded-[20px]'>
      {modalOpen && (
        <ModalComponent
          nft={item}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          Content={item.for_sale ? PurchaseModal : SellModal}
        />
      )}
      {bidsmodalOpen && (
        <ModalComponent
          nft={item}
          modalOpen={bidsmodalOpen}
          setModalOpen={setBidsModalOpen}
          Content={!isOwner ? BidModal : AcceptBidsModal}
        />
      )}
      <div className='relative w-[350px] h-[221px] '>
        <Image
          src={item.uri}
          fill
          className='rounded-t-[20px] object-cover'
          alt={item.name}
        />
        {path == "/bids" && (
          <div
            className={`m-auto absolute left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-b top-1/2 -translate-y-1/2 rounded-full ${
              isBidWinner
                ? "bg-appGreen/80 text-slate-700"
                : "bg-slate-600 text-appWhite"
            } text-sm justify-center `}
          >
            {userBidPrice} APT
          </div>
        )}
        {item.bid_enabled ? (
          <div className='absolute bottom-0 bg-gradient-to-b flex justify-between w-full from-[#191919]/30  to-[#1F211C]/50 bg-opacity-30 shadow-[_0px_-4px_4px] px-2 py-[5px] h-max shadow-black/25'>
            <p className='font-medium text-sm text-appWhite'>{`Low: ${
              item.min / 100000000
            } APT`}</p>
            <p className='font-medium text-sm text-appWhite'>{`High:${
              item.max / 100000000
            } APT`}</p>
          </div>
        ) : (
          <div className='absolute bottom-0 bg-gradient-to-b flex justify-between w-full from-[#191919]/30  to-[#1F211C]/50 bg-opacity-30 shadow-[_0px_-4px_4px] px-2 py-[5px] h-max shadow-black/25'>
            <p className='font-medium text-sm text-appWhite'>{`${item.price} APT`}</p>
          </div>
        )}
      </div>
      <div className='flex flex-col  h-[37%] ~px-2/4 justify-around items-center'>
        <p className='text-appBlack'>{item.name}</p>
        <p className='text-appBlack text-sm font-thin text-center '>
          {item.description}
        </p>
        <div className='flex gap-2 items-center'>
          <Image
            src={`/${rarity.toLowerCase()}.jpg`} // Dynamically set the source based on rarity
            width={24}
            height={24}
            alt='rarity'
            className='rounded-full animate-bounce'
          />
          <p className='text-appBlack'>{rarity}</p>
        </div>
      </div>
      <AppButton
        action={() =>
          item.for_sale && isOwner
            ? handleConfirmDeListing()
            : setModalOpen(true)
        }
        title={`${
          !item.for_sale && isOwner
            ? "List"
            : item.for_sale && isOwner
            ? "Delist"
            : "Buy"
        }`}
        style={`absolute ${
          path == "/" && !isBidWinner && item.bid_enabled ? "hidden" : "flex"
        } ${
          path == "/bids" && !isBidWinner ? "hidden" : "flex"
        } bottom-3 right-4`}
      />{" "}
      <AppButton
        action={
          isBidWinner
            ? () => toast.success("Click buy to purchase")
            : () => setBidsModalOpen(true)
        }
        title={
          isOwner
            ? "Bids"
            : isBidder && isBidWinner
            ? "Won"
            : isBidder
            ? "Rebid"
            : "Bid"
        }
        style={`${
          item.bid_enabled ? "flex" : "hidden"
        } absolute text-slate-700 hover:border-green-400 hover:text-slate-700  bottom-3 bg-green-400 left-4`}
      />
      <button
        onClick={handleAddToFavourites}
        className={`absolute ${
          path == "/" || path == "/favourites" ? "flex" : "hidden"
        } hover:-translate-y-1 active:scale-90 duration-100 cursor-pointer w-6 h-6 bg-appWhite flex items-center justify-center rounded-full top-4 right-4`}
      >
        <Star
          fill={favourites.includes(item.id.toString()) ? "red" : "white"}
          size={16}
          strokeWidth={1.5}
          color={favourites.includes(item.id.toString()) ? "red" : "gray"}
        />
      </button>
    </div>
  );
};

export default NFTCard;
