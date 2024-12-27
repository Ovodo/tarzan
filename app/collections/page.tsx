"use client";
import NFTCard, { NFT } from "@/components/NFTCard";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { fetchUserNfts } from "@/lib/slices/marketSlice";
import { override } from "@/utils/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [totalNFTs, setTotalNFTs] = useState(0);
  const { userNfts } = useAppSelector((state) => state.market);
  const { filterBy } = useAppSelector((state) => state.utils);
  const { account, signAndSubmitTransaction } = useWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchUserNfts({ account, filterBy }));
    setIsLoading(false);
  }, [filterBy]);

  return (
    <section className='w-full  flex ~mt-5/20  min-h-[60vh] justify-center items-center flex-wrap gap-8'>
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
        userNfts?.map((item, index) => (
          <NFTCard
            // fetchUserNFTs={fetchUserNFTs}
            key={index.toString()}
            item={item}
          />
        ))
      )}
    </section>
  );
}
