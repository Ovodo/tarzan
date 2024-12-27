"use client";
import Link from "next/link";
import React from "react";

const AppButton = ({
  dark = true,
  href,
  title,
  style,
  action,
}: {
  dark?: boolean;
  href?: string;
  title: string;
  style?: string;
  action?: any;
}) => {
  if (href) {
    return (
      <Link
        href={href}
        className={`${style} ${
          !style?.includes("bg-") &&
          "bg-primary hover:bg-white hover:text-primary"
        } duration-150 hover:border-primary hover:border border rounded-[8px] flex items-center justify-center w-[58px] h-[23px] p-4 text-white text-sm`}
      >
        {title}
      </Link>
    );
  }
  if (action) {
    return (
      <button
        onClick={action}
        className={`${style} ${
          !style?.includes("bg-") &&
          "bg-primary hover:bg-white hover:text-primary"
        } duration-150 hover:border-primary hover:border border rounded-[8px] flex items-center justify-center w-[58px] h-[23px] p-4 text-white text-sm`}
      >
        {title}
      </button>
    );
  }
};

export default AppButton;
