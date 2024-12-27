import React, { useState } from "react";
import { motion } from "framer-motion";
import OutsideClickHandler from "react-outside-click-handler";

import { ChevronDown } from "tabler-icons-react";
import InputLine from "./InputLine";
const SelectComponent = ({
  items,
  placeholder,
  onChange,
}: {
  items: any[];
  placeholder: string;
  onChange?: any;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setVal] = useState("");
  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setOpen(false);
      }}
    >
      <div className='flex items-center  max-w-max relative'>
        {open && (
          <motion.div
            // animate={{ height: ["0px", "240px"] }}
            className='w-full h-max z-10 absolute border scrollbar-hide bg-appWhite overflow-y-scroll'
          >
            {items?.map((item, i) => (
              <p
                key={i.toString()}
                style={{ fontSize: 14 }}
                onClick={() => {
                  onChange(item);
                  setVal(item);
                  setOpen(false);
                }}
                className='regular border-b py-2  px-2 text-appBlack hover:text-appWhite hover:bg-appBlack'
              >
                {item}
              </p>
            ))}
          </motion.div>
        )}
        <InputLine
          readOnly={true}
          styles={"bg-transparent border-2 rounded-md mr-2 regular text-[16px]"}
          placeholder={placeholder}
          value={value}
        />
        <div
          onClick={() => {
            setOpen(!open);
          }}
          className={`absolute ${
            open ? "rotate-180 " : "rotate-0"
          } duration-200 right-[13px] self-center`}
        >
          <ChevronDown size={16} color='#aab2c8' />
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default SelectComponent;
