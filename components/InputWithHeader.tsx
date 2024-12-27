import React from "react";

const InputWithHeader = ({
  placeholder,
  header,
  value,
}: {
  placeholder: string;
  header: string;
  value: any;
}) => {
  // --------------------------------------------VARIABLES

  //-----------------------------------------------------------FUNCTIONS

  //------------------------------------------------------------------USE EFFECTS
  return (
    <div className='my-2'>
      <p className='light text-ash2'>{header}</p>
      <input
        type='text'
        value={value}
        placeholder={placeholder}
        className='bg-white text-sm lg:text-base rounded-sm semiBold pb-2 my-[5px] md:my-[5px]  focus:outline-none focus:border-b-2 focus:border-binance_green w-[85%] px-2 py-1'
      />
    </div>
  );
};

export default React.memo(InputWithHeader);
