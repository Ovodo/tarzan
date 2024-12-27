"use client";
import NFTCard, { NFT } from "@/components/NFTCard";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { fetchAllNfts } from "@/lib/slices/marketSlice";
import {
  client,
  decodeNfts,
  marketplaceAddr,
  override,
} from "@/utils/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { HexString } from "aptos";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWallet();
  const { filterBy } = useAppSelector((state) => state.utils);
  const { nfts } = useAppSelector((state) => state.market);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchAllNfts({ account, filterBy }));
    setIsLoading(false);
  }, [filterBy]);
  return (
    <div className=''>
      <section className='w-full min-h-[60vh] items-center flex ~mt-5/20 justify-center flex-wrap gap-8'>
        {isLoading ? (
          <HashLoader
            color={"#07F307"}
            loading={true}
            cssOverride={override}
            size={50}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        ) : (
          nfts.map((item, index) => (
            <NFTCard key={index.toString()} item={item} />
          ))
        )}
      </section>
    </div>
  );
}
