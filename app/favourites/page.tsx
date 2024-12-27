"use client";
import NFTCard, { NFT } from "@/components/NFTCard";
import { useAppSelector } from "@/lib/hook";
import {
  client,
  decodeNfts,
  hexToUint8Array,
  marketplaceAddr,
  override,
} from "@/utils/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";

export default function Home() {
  const [nftees, setNfts] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWallet();
  const { marketplace, nfts } = useAppSelector((state) => state.market);
  const { filterBy } = useAppSelector((state) => state.utils);

  const fetchNFTs = async () => {
    if (!account) return;

    try {
      const res = (
        await client.view({
          function: `${marketplaceAddr}::Tarzan::get_nfts_by_favourites`,
          arguments: [account.address],
          type_arguments: [],
        })
      )[0] as string[];

      // Filter NFTs based on user favourites
      const filteredNfts = nfts.filter((nft: NFT) => {
        console.log("Bids", nft.bids);
        return res.includes(nft.id.toString());
      });

      setNfts(filteredNfts);
      setIsLoading(false);

      console.log("filtered", filteredNfts);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching NFTs by rarity:", error);
      toast.error("Failed to fetch NFTs.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchNFTs();
    setIsLoading(false);
  }, [account, filterBy]);
  return (
    <section className='w-full  min-h-[60vh] flex ~mt-5/20 justify-center items-center  flex-wrap gap-8'>
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
        nftees.map((item: NFT, index: number) => (
          <NFTCard key={index.toString()} item={item} />
        ))
      )}
    </section>
  );
}
