"use client";
import Input from "@/components/ui/input";
import { useState } from "react";

type BottomBarProps = {
  initialLocation: string | null;
  poiName: string | null;
};

const SearchMenu = ({ initialLocation, poiName }: BottomBarProps) => {
  const [showEntryInput, setShowEntryInput] = useState<boolean>(
    initialLocation === null
  );

  return (
    <div className="pointer-events-auto fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 flex h-[33dvh] flex-col justify-between gap-1.5 rounded-[36px] border border-white/60 bg-white/90 p-4 text-black shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl landscape:top-2 landscape:right-2 landscape:bottom-2 landscape:left-auto landscape:h-auto landscape:w-[33%] landscape:justify-center">
      {/* <h1>Budynek</h1> */}
      {!showEntryInput ? (
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="text-black/50">Wejście:</span>
          <span className="font-semibold">{poiName}</span>

          <button
            type="button"
            className="cursor-pointer text-blue-600 underline underline-offset-2 select-none active:text-blue-300"
            onClick={() => setShowEntryInput(!showEntryInput)}
          >
            zmień
          </button>
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-black/50 select-none">Skąd</span>

          <Input placeholder="Sala 8" />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-black/50 select-none">Dokąd?</span>

        <Input placeholder="Sala 8" />
      </label>
      <div></div>
      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-blue-600 font-semibold text-white transition duration-100 select-none active:scale-[0.98]"
      >
        GO
      </button>
    </div>
  );
};

export default SearchMenu;
