#[test_only]
module marketplace::test_utils {
    use std::signer;
    // use std::string;
    // use std::vector;

    use aptos_framework::account;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    // use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;

    public fun setup(
        aptos_framework: &signer, marketplace: &signer, buyer: &signer
    ): (address, address) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let marketplace_addr = signer::address_of(marketplace);
        account::create_account_for_test(marketplace_addr);
        coin::register<AptosCoin>(marketplace);

        let buyer_addr = signer::address_of(buyer);
        account::create_account_for_test(buyer_addr);
        coin::register<AptosCoin>(buyer);

        let coins = coin::mint(10000, &mint_cap);
        coin::deposit(marketplace_addr, coins);

        let coins = coin::mint(10000, &mint_cap);
        coin::deposit(buyer_addr, coins);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        (marketplace_addr, buyer_addr)
    }

    public fun increment_timestamp(seconds: u64) {
        timestamp::update_global_time_for_test(
            timestamp::now_microseconds() + (seconds * 1000000)
        );
    }
}
