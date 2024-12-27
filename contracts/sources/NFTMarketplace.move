// TODO# 1: Define Module and Marketplace Address
address marketplace {
module Tarzan {
    use 0x1::signer;
    use 0x1::vector;
    use 0x1::coin;
    use 0x1::option::{Self, Option};
    // use 0x1::timestamp;
    use 0x1::aptos_coin;
    use aptos_std::table::{Self, Table};
    use aptos_std::simple_map::{Self, SimpleMap};

    struct NFT has store, key {
        id: u64,
        owner: address,
        name: vector<u8>,
        description: vector<u8>,
        uri: vector<u8>,
        price: u64,
        bid_enabled: bool,
        bids: SimpleMap<address, u64>,
        bid_winner: Option<address>,
        for_sale: bool,
        rarity: u8 // 1 for common, 2 for rare, 3 for epic, etc.
    }

    struct Marketplace has key {
        nfts: vector<NFT>,
        user_favourites: Table<address, vector<u64>>,
        total_minted: u64,
        total_listed: u64,
        total_sales: u64
    }

    struct ListedNFT has copy, drop {
        id: u64,
        price: u64,
        rarity: u8
    }

    struct UserBids has copy {
        bids: SimpleMap<address, vector<u8>>
    }

    const ENOT_ADMIN: u64 = 100;
    const ENOT_OWNER: u64 = 101;
    const ENFT_NOT_LISTED: u64 = 102;
    const ENFT_ALREADY_LISTED: u64 = 103;
    const EINVALID_BID: u64 = 104;
    const EINVALID_PRICE: u64 = 105;
    const EBID_WINNER_EXISTS: u64 = 106;
    const EBID_NOT_ENABLED: u64 = 107;
    const EADRESS_NOT_IN_BID_LIST: u64 = 108;
    const EINVALID_RARITY: u64 = 109;
    const MARKETPLACE_FEE_PERCENT: u64 = 2; // 2% fee

    public entry fun initialize(_account: &signer) {
        let marketplace = Marketplace {
            nfts: vector::empty<NFT>(),
            user_favourites: table::new(),
            total_minted: 0,
            total_listed: 0,
            total_sales: 0
        };
        move_to(_account, marketplace);
    }

    public entry fun mint_nft(
        account: &signer,
        name: vector<u8>,
        description: vector<u8>,
        uri: vector<u8>,
        rarity: u8
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_id = vector::length(&marketplace.nfts);
        assert!(rarity <= 3, EINVALID_RARITY);

        let new_nft = NFT {
            id: nft_id,
            owner: signer::address_of(account),
            name,
            description,
            bid_enabled: false,
            bids: simple_map::new(),
            bid_winner: option::none(),
            uri,
            price: 0,
            for_sale: false,
            rarity
        };

        marketplace.total_minted = marketplace.total_minted + 1;
        vector::push_back(&mut marketplace.nfts, new_nft);

    }

    public entry fun list_for_sale(
        account: &signer,
        nft_id: u64,
        price: u64,
        bid_enabled: bool
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert_nft_is_not_listed(nft_ref);
        assert_price_is_valid(price);
        assert_there_is_no_bid_winner(nft_ref);

        nft_ref.for_sale = true;
        nft_ref.bid_enabled = bid_enabled;
        nft_ref.price = price;
        marketplace.total_listed = marketplace.total_listed + 1;
    }

    public entry fun delist_from_sale(account: &signer, nft_id: u64) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert_nft_is_listed(nft_ref);

        nft_ref.for_sale = false;
        marketplace.total_listed = marketplace.total_listed - 1;
        nft_ref.bid_enabled = false;
        nft_ref.price = 0;

    }

    public entry fun toggle_enable_bidding(
        account: &signer,
        nft_id: u64,
        price: u64,
        bid_enabled: bool
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert_nft_is_listed(nft_ref);
        assert_price_is_valid(price);
        assert_there_is_no_bid_winner(nft_ref);

        nft_ref.bid_enabled = bid_enabled;
        nft_ref.price = price;
    }

    public entry fun bid(
        account: &signer,
        nft_id: u64,
        price: u64
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        assert_price_is_valid(price);
        assert_there_is_no_bid_winner(nft_ref);
        assert_nft_is_listed(nft_ref);
        assert_bid_is_enabled(nft_ref);

        simple_map::upsert(&mut nft_ref.bids, signer::address_of(account), price);

    }

    public entry fun remove_bid(account: &signer, nft_id: u64) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        assert_nft_is_listed(nft_ref);
        assert_bid_is_enabled(nft_ref);
        assert_bid_list_contains_address(nft_ref, signer::address_of(account));

        simple_map::remove(&mut nft_ref.bids, &signer::address_of(account));

    }

    public entry fun select_bid_winner(
        account: &signer,
        nft_id: u64,
        winner: address
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert_nft_is_listed(nft_ref);
        assert_bid_is_enabled(nft_ref);
        assert_bid_list_contains_address(nft_ref, winner);

        nft_ref.bid_winner = option::some(winner);
    }

    public entry fun set_price(account: &signer, nft_id: u64, price: u64) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert_price_is_valid(price);
        nft_ref.price = price;
    }

    public entry fun toggle_favourites(account: &signer, id: u64) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        if (!table::contains(&marketplace.user_favourites, signer::address_of(account))) {
            let new_fav = vector::empty();
            table::add(
                &mut marketplace.user_favourites, signer::address_of(account), new_fav
            );
        };
        let favourites =
            table::borrow_mut(
                &mut marketplace.user_favourites, signer::address_of(account)
            );
        if (vector::contains<u64>(&*favourites, &id)) {
            let (found, i) = vector::find(&*favourites, |e| e == &id);
            if (found) {
                vector::remove(favourites, i);
            }
        } else {
            vector::push_back(favourites, id);
        }
    }

    public entry fun purchase_nft(
        account: &signer, nft_id: u64, payment: u64
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        assert_nft_is_listed(nft_ref);
        assert!(payment >= nft_ref.price, 401); // Insufficient payment

        // Calculate marketplace fee
        let fee = (nft_ref.price * MARKETPLACE_FEE_PERCENT) / 100;
        let seller_revenue = payment - fee;

        // Transfer payment to the seller and fee to the marketplace
        coin::transfer<aptos_coin::AptosCoin>(account, nft_ref.owner, seller_revenue);
        coin::transfer<aptos_coin::AptosCoin>(account, @marketplace, fee);

        // Transfer ownership
        nft_ref.owner = signer::address_of(account);
        nft_ref.for_sale = false;
        nft_ref.price = 0;
        marketplace.total_listed = marketplace.total_listed - 1;
    }

    public entry fun transfer_ownership(
        account: &signer, nft_id: u64, new_owner: address
    ) acquires Marketplace {
        let marketplace = get_marketplace(@marketplace);
        let nft_ref = vector::borrow_mut(&mut marketplace.nfts, nft_id);

        validate_owner(nft_ref, account);
        assert!(nft_ref.owner != new_owner, 301); // Prevent transfer to the same owner

        // Update NFT ownership and reset its for_sale status and price
        nft_ref.owner = new_owner;
        nft_ref.for_sale = false;
        nft_ref.price = 0;
        marketplace.total_listed = marketplace.total_listed - 1;

    }

    #[view]
    public fun is_marketplace_initialized(): bool {
        exists<Marketplace>(@marketplace)
    }

    #[view]
    public fun get_nft_details(
        nft_id: u64
    ): (
        u64,
        address,
        vector<u8>,
        vector<u8>,
        vector<u8>,
        u64,
        bool,
        SimpleMap<address, u64>,
        Option<address>,
        bool,
        u8
    ) acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft = vector::borrow(&marketplace.nfts, nft_id);

        (
            nft.id,
            nft.owner,
            nft.name,
            nft.description,
            nft.uri,
            nft.price,
            nft.bid_enabled,
            nft.bids,
            nft.bid_winner,
            nft.for_sale,
            nft.rarity
        )
    }

    #[view]
    public fun is_nft_for_sale(nft_id: u64): bool acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft = vector::borrow(&marketplace.nfts, nft_id);
        nft.for_sale
    }

    #[view]
    public fun get_nft_price(nft_id: u64): u64 acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft = vector::borrow(&marketplace.nfts, nft_id);
        nft.price
    }

    // #[view]
    // public fun get_nft_bids(nft_id: u64): Table<address,u64> acquires Marketplace {
    //     let marketplace = borrow_global<Marketplace>(@marketplace);
    //     let nft = vector::borrow(&marketplace.nfts, nft_id);
    //     nft.bids
    // }

    #[view]
    public fun get_owner(nft_id: u64): address acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft = vector::borrow(&marketplace.nfts, nft_id);
        nft.owner
    }

    #[view]
    public fun get_all_nfts_for_owner(
        owner_addr: address, limit: u64, offset: u64
    ): vector<u64> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft_ids = vector::empty<u64>();

        let nfts_len = vector::length(&marketplace.nfts);
        let end = min(offset + limit, nfts_len);
        let mut_i = offset;
        while (mut_i < end) {
            let nft = vector::borrow(&marketplace.nfts, mut_i);
            if (nft.owner == owner_addr) {
                vector::push_back(&mut nft_ids, nft.id);
            };
            mut_i = mut_i + 1;
        };

        nft_ids
    }

    #[view]
    public fun get_all_nfts_for_sale(limit: u64, offset: u64): vector<ListedNFT> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nfts_for_sale = vector::empty<ListedNFT>();

        let nfts_len = vector::length(&marketplace.nfts);
        let end = min(offset + limit, nfts_len);
        let mut_i = offset;
        while (mut_i < end) {
            let nft = vector::borrow(&marketplace.nfts, mut_i);
            if (nft.for_sale) {
                let listed_nft = ListedNFT {
                    id: nft.id,
                    price: nft.price,
                    rarity: nft.rarity
                };
                vector::push_back(&mut nfts_for_sale, listed_nft);
            };
            mut_i = mut_i + 1;
        };

        nfts_for_sale
    }

    #[view]
    public fun get_nfts_by_rarity(rarity: u8): vector<u64> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft_ids = vector::empty<u64>();

        let nfts_len = vector::length(&marketplace.nfts);
        let mut_i = 0;
        while (mut_i < nfts_len) {
            let nft = vector::borrow(&marketplace.nfts, mut_i);
            if (nft.rarity == rarity) {
                vector::push_back(&mut nft_ids, nft.id);
            };
            mut_i = mut_i + 1;
        };

        nft_ids
    }

    #[view]
    public fun get_nfts_by_favourites(user: address): vector<u64> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(@marketplace);
        let nft_ids = vector::empty<u64>();
        if (!table::contains(&marketplace.user_favourites, user)) {
            return vector::empty()
        };

        let nfts_len = vector::length(&marketplace.nfts);
        let mut_i = 0;
        while (mut_i < nfts_len) {
            let nft = vector::borrow(&marketplace.nfts, mut_i);
            if (vector::contains(
                table::borrow(&marketplace.user_favourites, user), &nft.id
            )) {
                vector::push_back(&mut nft_ids, nft.id);
            };
            mut_i = mut_i + 1;
        };

        nft_ids
    }

    #[view]
    public fun get_user_bids(nft_id: u64) {}

    // #[view]
    // public fun sort_given_nfts(nfts:&vector<NFT>):vector<u64> {
    //     let len = vector::length(nfts);
    //     let sorted_indices = vector::empty<u64>();

    //     // Initialize sorted_indices with [0, 1, ... len-1]
    //     let  i = 0;
    //     while (i < len) {
    //         vector::push_back(&mut sorted_indices, i);
    //         i = i + 1;
    //     };

    //     i = 1;
    //     while (i < len) {
    //         let  j = i;
    //         while (j > 0) {
    //             let prev_index = *vector::borrow(&sorted_indices, j - 1);
    //             let current_index = *vector::borrow(&sorted_indices, j);
    //             let prev_nft = vector::borrow(nfts, prev_index);
    //             let current_nft = vector::borrow(nfts, current_index);

    //             if (prev_nft.price < current_nft.price || (prev_nft.price == current_nft.price && prev_index > current_index)) {
    //                 // Swap the indices
    //                 let tmp = current_index;
    //                 *vector::borrow_mut(&mut sorted_indices, j) = prev_index;
    //                 *vector::borrow_mut(&mut sorted_indices, j - 1) = tmp;
    //             } else {
    //                 break
    //             };
    //             j = j - 1;
    //         };
    //         i = i + 1;
    //     };
    //     sorted_indices

    // }

    /*-------------------Helper function to find the minimum of two u64 numbers--*/
    inline fun min(a: u64, b: u64): u64 {
        if (a < b) { a }
        else { b }
    }

    inline fun get_marketplace(add: address): &mut Marketplace acquires Marketplace {
        let marketplace = borrow_global_mut<Marketplace>(add);
        marketplace
    }

    inline fun validate_owner(nft: &mut NFT, account: &signer) {
        assert!(nft.owner == signer::address_of(account), ENOT_OWNER);
    }

    inline fun assert_nft_is_not_listed(nft: &mut NFT) {
        assert!(!nft.for_sale, ENFT_ALREADY_LISTED);
    }

    inline fun assert_nft_is_listed(nft: &mut NFT) {
        assert!(nft.for_sale, ENFT_NOT_LISTED);
    }

    inline fun assert_price_is_valid(price: u64) {
        assert!(price > 0, EINVALID_PRICE);
    }

    inline fun assert_there_is_no_bid_winner(nft: &mut NFT) {
        assert!(option::is_none(&nft.bid_winner), EBID_WINNER_EXISTS);
    }

    inline fun assert_bid_is_enabled(nft: &mut NFT) {
        assert!(nft.bid_enabled, EBID_NOT_ENABLED);
    }

    inline fun assert_bid_list_contains_address(
        nft: &mut NFT, account: address
    ) {
        assert!(simple_map::contains_key(&nft.bids, &account), EADRESS_NOT_IN_BID_LIST);

    }

    /* --------------------Tests-------------------------*/
    #[test_only]
    use marketplace::test_utils;

    #[test(account = @marketplace)]
    fun test_initialize_marketplace(account: &signer) {
        initialize(account);
        assert!(is_marketplace_initialized(), 100);

    }

    #[test(account = @marketplace)]
    #[expected_failure]
    fun test_reinitialize_marketplace_failed(account: &signer) {
        initialize(account);
        initialize(account);

    }

    #[test(account = @marketplace)]
    fun test_mint_nft(account: &signer) acquires Marketplace {
        initialize(account);
        let name = b"Test NFT";
        let description = b"Description of Test NFT";
        let uri = b"https://example.com/test_nft";
        let rarity = 2;

        mint_nft(account, name, description, uri, rarity);

        let (
            id,
            owner,
            fetched_name,
            fetched_description,
            fetched_uri,
            price,
            fetched_bid_enabled,
            fetched_bids,
            fetched_bid_winner,
            for_sale,
            fetched_rarity
        ) = get_nft_details(0);

        assert!(id == 0, 101);
        assert!(owner == signer::address_of(account), 102);
        assert!(fetched_name == name, 103);
        assert!(fetched_description == description, 104);
        assert!(fetched_uri == uri, 105);
        assert!(price == 0, 106);
        assert!(!for_sale, 107);
        assert!(fetched_rarity == rarity, 108);
    }

    #[test(account = @marketplace)]
    #[expected_failure(abort_code = 109)]
    fun test_mint_nft_failed_invalid_rarity(account: &signer) acquires Marketplace {
        initialize(account);
        let name = b"Test NFT";
        let description = b"Description of Test NFT";
        let uri = b"https://example.com/test_nft";
        let rarity = 4;

        mint_nft(account, name, description, uri, rarity);

        let (
            id,
            owner,
            fetched_name,
            fetched_description,
            fetched_uri,
            price,
            fetched_bid_enabled,
            fetched_bids,
            fetched_bid_winner,
            for_sale,
            fetched_rarity
        ) = get_nft_details(0);

        assert!(id == 0, 101);
        assert!(owner == signer::address_of(account), 102);
        assert!(fetched_name == name, 103);
        assert!(fetched_description == description, 104);
        assert!(fetched_uri == uri, 105);
        assert!(price == 0, 106);
        assert!(!for_sale, 107);
        assert!(fetched_rarity == rarity, 108);
    }

    #[test(account = @marketplace)]
    fun test_list_for_sale(account: &signer) acquires Marketplace {
        initialize(account);
        let name = b"Test NFT";
        let description = b"Description of Test NFT";
        let uri = b"https://example.com/test_nft";
        let rarity = 2;
        mint_nft(account, name, description, uri, rarity);
        let price = 1000;

        list_for_sale(account, 0, price, false);

        let for_sale = is_nft_for_sale(0);
        let listed_price = get_nft_price(0);

        assert!(for_sale, 109);
        assert!(listed_price == price, 110);
    }

    #[test(account = @marketplace)]
    fun test_delist_from_sale(account: &signer) acquires Marketplace {
        initialize(account);
        let name = b"Test NFT";
        let description = b"Description of Test NFT";
        let uri = b"https://example.com/test_nft";
        let rarity = 2;
        mint_nft(account, name, description, uri, rarity);
        let price = 1000;

        list_for_sale(account, 0, price, false);
        delist_from_sale(account, 0);

        let for_sale = is_nft_for_sale(0);
        let marketplace = get_marketplace(@marketplace);

        assert!(marketplace.total_listed == 0, 300);
        assert!(!for_sale, 109);
    }

    #[test(aptos = @0x1, account1 = @marketplace, account2 = @0x8)]
    fun test_purchase_nft(
        aptos: signer, account1: &signer, account2: &signer
    ) acquires Marketplace {
        let (admin_addr, buyer_addr) = test_utils::setup(&aptos, account1, account2);
        initialize(account1);
        let name = b"Test NFT";
        let description = b"Description of Test NFT";
        let uri = b"https://example.com/test_nft";
        let rarity = 2;

        mint_nft(account1, name, description, uri, rarity);
        let price = 1000;

        list_for_sale(account1, 0, price, false);
        purchase_nft(account2, 0, price);

        let new_owner = get_owner(0);
        let for_sale = is_nft_for_sale(0);

        assert!(new_owner == signer::address_of(account2), 111);
        assert!(!for_sale, 112);
    }

    #[test(account = @marketplace)]
    fun test_get_nfts_by_rarity(account: &signer) acquires Marketplace {
        initialize(account);

        // Mint NFTs with different rarities
        mint_nft(
            account,
            b"Common NFT",
            b"Description",
            b"https://example.com/common",
            1
        );
        mint_nft(
            account,
            b"Rare NFT",
            b"Description",
            b"https://example.com/rare",
            2
        );

        let common_nfts = get_nfts_by_rarity(1);
        let rare_nfts = get_nfts_by_rarity(2);

        assert!(vector::length(&common_nfts) == 1, 113);
        assert!(vector::length(&rare_nfts) == 1, 114);
    }
}
}
