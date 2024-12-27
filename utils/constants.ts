import { NFT } from "@/components/NFTCard";
import { AptosClient } from "aptos";
import { CSSProperties } from "react";

export const marketplaceAddr =
  "0x5bed71a748e5901515c7ad5e8459ad1c8f9959aa23060bac0de4dddc098598ec";

export const client = new AptosClient(
  "https://fullnode.devnet.aptoslabs.com/v1"
);

export const nfts = [
  {
    id: 1,
    name: "Oceanic Whisper",
    description:
      "A serene moment captured in the vast blue depths of the ocean.",
    uri: "https://fastly.picsum.photos/id/186/200/200.jpg?hmac=bNtKzMZT8HFzZq8mbTSWaQvmkX8T7TE47fspKMfxVl8",
    rarity: 0,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 2,
    name: "Forest Mirage",
    description: "An enchanted forest where light and shadow play in harmony.",
    uri: "https://fastly.picsum.photos/id/255/200/200.jpg?hmac=IYQV36UT5-F1dbK_CQXF7PDfLfwcnwKijqeBCo3yMlc",
    rarity: 2,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 3,
    name: "Galactic Pulse",
    description: "The heartbeat of the universe, emanating in waves of color.",
    uri: "https://fastly.picsum.photos/id/522/200/200.jpg?hmac=-4K81k9CA5C9S2DWiH5kP8rMvaAPk2LByYZHP9ejTjA",
    rarity: 1,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 4,
    name: "Lunar Blossom",
    description: "A rare flower blooming under the soft glow of the moon.",
    uri: "https://fastly.picsum.photos/id/501/200/200.jpg?hmac=tKXe69j4tHhkAA_Qc3XinkTuubEWwkFVhA9TR4TmCG8",
    rarity: 0,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 5,
    name: "Ember Phoenix",
    description:
      "A fiery bird rising from the ashes, symbolizing rebirth and strength.",
    uri: "https://fastly.picsum.photos/id/68/200/200.jpg?hmac=CPg7ZGK1PBwt6DmjjPRApX_t-mOiYxt0pel50VH4Gwk",
    rarity: 2,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 6,
    name: "Starlit Haven",
    description: "A sanctuary under a blanket of shimmering stars.",
    uri: "https://fastly.picsum.photos/id/891/200/200.jpg?hmac=J19K6yDbzNDUjkInb56-h-n_xM3i40GCfHWor0YKgyU",
    rarity: 0,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 7,
    name: "Mystic Aurora",
    description:
      "The northern lights captured in their most vibrant and magical form.",
    uri: "https://fastly.picsum.photos/id/999/200/200.jpg?hmac=iwXALEStJtHL4Thxk_YbLNHNmjq9ZrIQYFUvtxndOaU",
    rarity: 1,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
  {
    id: 8,
    name: "Crystal Echo",
    description: "The sound of crystal chimes resonating in an ethereal realm.",
    uri: "https://fastly.picsum.photos/id/338/200/200.jpg?hmac=5S5SeR5xW8mbN3Ml7wTTJPePX392JafhcFMGm7IFNy0",
    rarity: 0,
    bid_enabled: false,
    bids: {},
    bid_winner: "",
    price: 0.5,
    owner: "0xb53f489jj292829282",
    for_sale: false,
  },
];

export const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export const hexToUint8Array = (hexString: string): Uint8Array => {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
};

export const decodeNfts = (nftList: NFT[]) => {
  const res = nftList.map((nft: NFT) => {
    // assingning min and max bid values
    let min: number = Infinity;
    let max: number = 0;
    (nft.bids as any).data?.forEach((item: any) => {
      min = min < item.value ? min : item.value;
      max = max > item.value ? max : item.value;
    });
    return {
      ...nft,
      name: new TextDecoder().decode(hexToUint8Array(nft.name.slice(2))),
      description: new TextDecoder().decode(
        hexToUint8Array(nft.description.slice(2))
      ),
      uri: new TextDecoder().decode(hexToUint8Array(nft.uri.slice(2))),
      price: nft.price / 100000000,
      bids: (nft.bids as any).data,
      bid_winner: (nft.bid_winner as any).vec[0],
      min: min === Infinity ? 0 : min,
      max: max,
    };
  });
  return res;
};
