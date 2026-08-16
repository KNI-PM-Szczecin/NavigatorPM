import React from "react";

type pillProps = {
  buildingName: string | null;
};

const Pill = ({ buildingName }: pillProps) => {
  return (
    <div className="pointer-events-auto fixed top-[calc(0.5rem+env(safe-area-inset-top))] left-2 z-50 flex h-auto w-fit max-w-[calc(100%-1rem)] flex-col justify-between gap-1.5 rounded-[36px] border border-blue-400 bg-white/90 p-4 text-black shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <p>{buildingName ?? "Brak nazwy budynku"}</p>
    </div>
  );
};

export default Pill;
