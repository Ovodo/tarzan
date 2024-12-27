import React from "react";
import { usePathname } from "next/navigation";

const InputLine = ({
  placeholder,
  type,
  value,
  onChange,
  styles,
  onKeyDown,
  readOnly,
}: {
  placeholder: string;
  type?: string;
  value?: any;
  onChange?: any;
  styles: string;
  onKeyDown?: any;
  readOnly: boolean;
}) => {
  // --------------------------------------------VARIABLES
  const location = usePathname();
  const isRegister = location.split("/").pop() === `register`;

  //-----------------------------------------------------------FUNCTIONS

  //------------------------------------------------------------------USE EFFECTS
  return (
    <input
      value={value}
      onInput={onChange}
      readOnly={readOnly}
      type={type}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      // className={`border-b-2  pb-2 my-[20px] md:my-[10px] border-gray-400 focus:outline-none focus:border-b-2 focus:border-binance_green px-2 py-1`}
      className={`appearance-none border-b-2 ${styles} ${
        isRegister ? "my-[10px]  md:my-[5px]" : "my-[20px] md:my-[10px] pb-2"
      }
      border-gray-400 focus:outline-none focus:border-b-2 
      focus:border-binance_green  w-full ~px-1/2 py-1`}
    />
  );
};

export default React.memo(InputLine);
