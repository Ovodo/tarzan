"use client";
import { client } from "@/utils/constants";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button, Dropdown, Menu, Space, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, Logout } from "tabler-icons-react";

const { Text } = Typography;

const Navbar = () => {
  const { connected, account, network, disconnect } = useWallet(); // Add disconnect here
  const [balance, setBalance] = useState<number | null>(null);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await disconnect(); // Disconnect the wallet
      setBalance(null); // Clear balance on logout
      toast.success("Disconnected from wallet");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect from wallet");
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const resources: any[] = await client.getAccountResources(
            account.address
          );
          const accountResource = resources.find(
            (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
          );
          if (accountResource) {
            const balanceValue = (accountResource.data as any).coin.value;
            setBalance(balanceValue ? parseInt(balanceValue) / 100000000 : 0);
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    if (connected) {
      fetchBalance();
    }
  }, [account, connected]);

  return (
    <div className='w-full flex sm:p-[30px] items-center justify-between sm:h-[90px]'>
      <section className='flex items-center gap-2'>
        <Image
          src={"/tarzan.jpg"}
          width={48}
          height={48}
          className='rounded-full'
          alt='tarzan'
        />
        <h4 className='font-medium text-appWhite text-[36px]'>TArzan</h4>
      </section>
      <ul className='font-medium text-appGreen flex items-center gap-[100px] text-[24px]'>
        <li
          className={`hover:text-appWhite duration-150 cursor-pointer ${
            pathname === "/" ? "text-appWhite border-b-appGreen border-b" : ""
          }`}
        >
          <Link href={"/"}>Marketplace</Link>
        </li>
        <li
          className={`hover:text-appWhite duration-150 cursor-pointer ${
            pathname === "/favourites"
              ? "text-appWhite border-b-appGreen border-b"
              : ""
          }`}
        >
          <Link href={"/favourites"}>Favourites</Link>
        </li>
        <li
          className={`hover:text-appWhite duration-150 cursor-pointer ${
            pathname === "/collections"
              ? "text-appWhite border-b-appGreen border-b"
              : ""
          }`}
        >
          <Link href={"/collections"}>My Collections</Link>
        </li>
        <li
          className={`hover:text-appWhite duration-150 cursor-pointer ${
            pathname === "/bids"
              ? "text-appWhite border-b-appGreen border-b"
              : ""
          }`}
        >
          <Link href={"/bids"}>Bids</Link>
        </li>
      </ul>
      <Space style={{ alignItems: "center" }}>
        {connected && account ? (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='address'>
                  <Text strong>Address:</Text> <br />
                  <Text copyable>{account.address}</Text>
                </Menu.Item>
                <Menu.Item key='network'>
                  <Text strong>Network:</Text>{" "}
                  {network ? network.name : "Unknown"}
                </Menu.Item>
                <Menu.Item key='balance'>
                  <Text strong>Balance:</Text>{" "}
                  {balance !== null ? `${balance} APT` : "Loading..."}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key='logout'
                  icon={<Logout />}
                  onClick={handleLogout}
                >
                  Log Out
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <Button type='primary'>
              Connected <ArrowDown size={12} />
            </Button>
          </Dropdown>
        ) : (
          <WalletSelector />
        )}
      </Space>
    </div>
  );
};

export default Navbar;
