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
import { HexString } from "aptos";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";

export default function Home() {
  const [nfts, setNfts] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWallet();
  const { marketplace } = useAppSelector((state) => state.market);

  const fetchNFTs = async (selectedRarity: number | undefined) => {
    if (!account) return;

    try {
      const decodedNfts = decodeNfts(marketplace.nfts);

      console.log(decodedNfts);

      // Filter NFTs based on `for_sale` property and rarity if selected
      const filteredNfts = decodedNfts.filter((nft) => {
        console.log("Bids", nft.bids);
        const bids = nft.bids.map((item: any) => item.key.toString());
        return bids.includes(
          HexString.ensure((account?.address as string) ?? "").toShortString()
        );
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
    fetchNFTs(undefined);
  }, []);
  return (
    <section className='w-full  min-h-[60vh] items-center flex ~mt-5/20 justify-center flex-wrap gap-8'>
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
        nfts.map((item: NFT, index: number) => (
          <NFTCard key={index.toString()} item={item} />
        ))
      )}
    </section>
  );
}
