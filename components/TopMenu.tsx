"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { useState } from "react";
import Marquee from "react-fast-marquee";
import { ArrowDown, ArrowUp } from "tabler-icons-react";
import AppButton from "./AppButton";
import MintModal from "./modals/MintModal";
import ModalComponent from "./modals/ModalComponent";

import { setFilterBy } from "@/lib/slices/utilsSlice";

const TopMenu = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setShowFilter] = useState(false);
  const { marketplace } = useAppSelector((state) => state.market);
  const dispatch = useAppDispatch();

  return (
    <div className='w-full  flex px-[30px]  relative  items-center'>
      {modalOpen && (
        <ModalComponent
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          Content={MintModal}
        />
      )}
      <AppButton
        title='Mint NFT'
        action={() => setModalOpen(true)}
        style={"~w-20/40 ~py-2/6 mr-2"}
      />

      <Marquee>
        <div className='flex items-center   overflow-y-hidden gap-[100px]'>
          <p className='text-appWhite text-[20px]'>
            Total Sales : {marketplace?.total_sales}
          </p>
          <p className='text-appWhite text-[20px]'>
            Total Listed : {marketplace?.total_listed}
          </p>
          <p className='text-appWhite text-[20px]'>
            Total Minted : {marketplace?.total_minted}
          </p>
        </div>
      </Marquee>
      <div className='flex relative gap-1 justify-end  w-[10vw] items-center'>
        <button
          onClick={() => setShowFilter(!filter)}
          className='text-appWhite  justify-center flex items-center'
        >
          Filter By
        </button>
        {filter ? (
          <ArrowDown color='white' size={16} />
        ) : (
          <ArrowUp color='white' size={16} />
        )}
        {filter && (
          <div className='absolute z-50 flex flex-col items-start gap-4 py-4 top-6 right-0  w-[100px] h-auto bg-appWhite rounded-sm'>
            <button
              onClick={() => dispatch(setFilterBy("")) && setShowFilter(false)}
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              None
            </button>
            <button
              onClick={() =>
                dispatch(setFilterBy("down")) && setShowFilter(false)
              }
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              Price <ArrowUp size={12} />
            </button>
            <button
              onClick={() =>
                dispatch(setFilterBy("up")) && setShowFilter(false)
              }
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              Price <ArrowDown size={12} />
            </button>
            <button
              onClick={() =>
                dispatch(setFilterBy("gold")) && setShowFilter(false)
              }
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              <p className='text-appBlack text-sm'>{"Gold"}</p>
            </button>
            <button
              onClick={() =>
                dispatch(setFilterBy("silver")) && setShowFilter(false)
              }
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              <p className='text-appBlack text-sm'>{"Silver"}</p>
            </button>
            <button
              onClick={() =>
                dispatch(setFilterBy("bronze")) && setShowFilter(false)
              }
              className='flex text-sm hover:bg-cyan-300 w-full pl-6 p-1 gap-2 items-center'
            >
              <p className='text-appBlack text-sm'>{"Bronze"}</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMenu;
