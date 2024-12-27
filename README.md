# Tarzan - An NFT marketplace on the Aptos Blockchain

    This is an nft marketplace for users to mint, list, bid and buy nfts on the aptos chain

## New Features Overview

The latest marketplace update introduces exciting features that improves statistics, filtering, and a bid purchase system. Here's a brief overview of each new feature, along with their associated components:

## 1. Bid System

**Description:**  
Users can now set if an asset is bid enabled or not when listing. If it is, buyers will have to place a bid and then the owner would accept the best bid to his taste before the asset can be purchased. After the bid has been accepted, the winner will have the won tag associated with the nft in his bids page and can now be allowed to purchase.

**components / pages:**

- `components/modals/AcceptBidsModal`: Used to accept a bid
- `components/modals/BidModal`: Modal to place a bid
- `app/bids/page`: Bids page to show all users bids

## 2. Statistics

**Description:**  
Litle statistics like `total_sales`,`total_minted` and `total_listed` have been added to the smart contract `MarketPlace` struct. These values are increased or reduces as the user interacts with the smart contract. This is displayed on the top menu on the web page.

**components / pages:**

- `components/TopMenu`: Top section to show stats.

## 3. Favourites

**Description:**  
Users can now click on the star icon to add certain nfts to their favourites page. This help for easy access to certain nfts that the user likes and may not want to purchase at the moment.

**components / pages:**

- `app/favourites/page`: Page to show favourites.

## 4. Filter

**Description:**  
For easy access and sorting of nfts, a filter has been added where by the user can filter by ascending or decending prices, and also by the rarity.

**components / pages:**

- `components/TopMenu`: Top section also containg the filter section.

## Setup and Run

### Frontend (Next.js)

1. `npm install`: - add the `--legacy-peer-deps` to resolve conflicts.
2. `npm run dev`

## Approach / Architecture

- Implemented the frontend with Next.js and React.
- Used aptos move for the backend/ smart contract `contracts/sources/NFTMarketplace.move`
- Used redux for a centralized store hosting contract view functions for easy access.

## Libraries

- Next.js
- Redux
