import React from "react";

type InputProps = {
  placeholder: string;
};

const Input = ({ placeholder }: InputProps) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="h-12 w-full rounded-2xl bg-black/4 px-4 text-lg transition duration-100 ease-in-out outline-none placeholder:text-black/50 hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-500/30"
    />
  );
};

export default Input;
