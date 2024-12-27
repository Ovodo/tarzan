import { NFT } from "@/components/NFTCard";
import {
  client,
  decodeNfts,
  hexToUint8Array,
  marketplaceAddr,
} from "@/utils/constants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { HexString } from "aptos";

interface ChartDataState {
  candlestickData: any;
  nfts: NFT[];
  userNfts: NFT[];
  marketplace: any;
  loading: boolean;
  error: string | null;
}

const initialState: ChartDataState = {
  candlestickData: null,
  nfts: [],
  userNfts: [],
  marketplace: null,
  loading: false,
  error: null,
};

export const fetchAllNfts = createAsyncThunk(
  "api/nfts",
  async ({ account, filterBy }: { account: any; filterBy: string }) => {
    const response = await client.getAccountResource(
      marketplaceAddr,
      "0x5bed71a748e5901515c7ad5e8459ad1c8f9959aa23060bac0de4dddc098598ec::Tarzan::Marketplace"
    );
    const nftList = (response.data as { nfts: NFT[] }).nfts;

    const decodedNfts = decodeNfts(nftList);

    // Filter NFTs based on `for_sale` property and rarity if selected
    const filteredNfts = decodedNfts.filter(
      (nft) =>
        nft.owner !==
          HexString.ensure(
            (account?.address as string) ?? ""
          ).toShortString() && nft.for_sale
    );

    if (filterBy === "up") {
      return filteredNfts.sort((a, b) => a.price - b.price);
    } else if (filterBy === "down") {
      return filteredNfts.sort((a, b) => b.price - a.price);
    } else if (filterBy === "gold") {
      return filteredNfts.filter((item) => item.rarity === 0);
    } else if (filterBy === "silver") {
      return filteredNfts.filter((item) => item.rarity === 1);
    } else if (filterBy === "bronze") {
      return filteredNfts.filter((item) => item.rarity === 2);
    } else {
      return filteredNfts;
    }
  }
);

export const fetchUserNfts = createAsyncThunk(
  "api/user/nfts",
  async ({ account, filterBy }: { account: any; filterBy: string }) => {
    if (!account) return;

    const nftIdsResponse = await client.view({
      function: `${marketplaceAddr}::Tarzan::get_all_nfts_for_owner`,
      arguments: [account.address, "100", "0"],
      type_arguments: [],
    });

    const nftIds = Array.isArray(nftIdsResponse[0])
      ? nftIdsResponse[0]
      : nftIdsResponse;

    if (nftIds.length === 0) {
      console.log("No NFTs found for the owner.");
      return [];
    }

    console.log("Fetching details for each NFT ID:", nftIds);

    const userNFTs = (
      await Promise.all(
        nftIds.map(async (id) => {
          try {
            const nftDetails = await client.view({
              function: `${marketplaceAddr}::Tarzan::get_nft_details`,
              arguments: [id],
              type_arguments: [],
            });
            console.log(nftDetails);

            const [
              nftId,
              owner,
              name,
              description,
              uri,
              price,
              bid_enabled,
              bids,
              bidWinner,
              forSale,
              rarity,
            ] = nftDetails as [
              number,
              string,
              string,
              string,
              string,
              number,
              boolean,
              Record<string, number>,
              string[],
              boolean,
              number
            ];

            // assingning min and max bid values
            let min: number = Infinity;
            let max: number = 0;
            (bids as any).data?.forEach((item: any) => {
              min = min < item.value ? min : item.value;
              max = max > item.value ? max : item.value;
            });

            return {
              id: nftId,
              owner,
              name: new TextDecoder().decode(hexToUint8Array(name.slice(2))),
              description: new TextDecoder().decode(
                hexToUint8Array(description.slice(2))
              ),
              uri: new TextDecoder().decode(hexToUint8Array(uri.slice(2))),
              price: price / 100000000, // Convert octas to APT
              bid_enabled,
              bids: (bids as any).data,
              bid_winner: (bidWinner as any).vec[0],
              for_sale: forSale,
              rarity,
              min: min === Infinity ? 0 : min,
              max: max,
            };
          } catch (error) {
            console.error(`Error fetching details for NFT ID ${id}:`, error);
            return null;
          }
        })
      )
    ).filter((nft): nft is NFT => nft !== null);

    if (filterBy === "up") {
      return userNFTs.sort((a, b) => a.price - b.price);
    } else if (filterBy === "down") {
      return userNFTs.sort((a, b) => b.price - a.price);
    } else if (filterBy === "gold") {
      return userNFTs.filter((item) => item.rarity === 0);
    } else if (filterBy === "silver") {
      return userNFTs.filter((item) => item.rarity === 1);
    } else if (filterBy === "bronze") {
      return userNFTs.filter((item) => item.rarity === 2);
    } else {
      return userNFTs;
    }
  }
);

export const fetchMarketPlace = createAsyncThunk(
  "api/marketplace",
  async () => {
    const response = await client.getAccountResource(
      marketplaceAddr,
      "0x5bed71a748e5901515c7ad5e8459ad1c8f9959aa23060bac0de4dddc098598ec::Tarzan::Marketplace"
    );
    return response.data;
  }
);

const chartSlice = createSlice({
  name: "charts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNfts.fulfilled, (state, action) => {
        state.loading = false;
        state.nfts = action.payload;
      })
      .addCase(fetchAllNfts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch line chart data";
      })
      .addCase(fetchUserNfts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNfts.fulfilled, (state, action) => {
        state.loading = false;
        state.userNfts = action.payload as NFT[];
      })
      .addCase(fetchUserNfts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bar chart data";
      })
      .addCase(fetchMarketPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketPlace.fulfilled, (state, action) => {
        state.loading = false;
        state.marketplace = action.payload;
      })
      .addCase(fetchMarketPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch marketplace";
      });
  },
});

export default chartSlice.reducer;
