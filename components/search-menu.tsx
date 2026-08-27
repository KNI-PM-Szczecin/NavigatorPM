"use client";
import { GlowGlassCard } from "@/components/ui/glasscard";
import SearchInput from "@/components/ui/search-input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type poiLabel = {
  id: string;
  name: string;
};

type BottomBarProps = {
  startPosition: poiLabel | null;
  poiList: Array<poiLabel> | null;
};

const SearchMenu = ({ startPosition, poiList }: BottomBarProps) => {
  const router = useRouter();
  const [showEntryInput, setShowEntryInput] = useState<boolean>(
    startPosition === null
  );
  const [originId, setOriginId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const onDestinationChanged = (value: poiLabel | null) => {
    setDestinationId(value != null ? value.id : null);
  };

  const onOriginChanged = (value: poiLabel | null) => {
    setOriginId(value != null ? value.id : null);
  };

  const go = () => {
    const destination = destinationId;

    if (!destination) return;
    const params = new URLSearchParams();

    const origin = originId ?? startPosition?.id ?? null;
    if (!origin) return;

    // let's check if our user is a fucking dumbass
    if (origin === destination) {
      console.log("You are a fucking moron");
      return;
    }

    params.set("from", origin);
    params.set("to", destination);

    router.push(`/?${params}`);
  };

  return (
    <GlowGlassCard
      className="pointer-events-auto fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 h-[33dvh] p-4 text-black landscape:top-2 landscape:right-2 landscape:bottom-2 landscape:left-auto landscape:h-auto landscape:w-[33%]"
      contentClassName="flex h-full flex-col justify-between gap-3 landscape:justify-center"
    >
      {!showEntryInput ? (
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="text-black/50">Wejście:</span>
          <span className="font-semibold">{startPosition?.name}</span>

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

          <SearchInput
            placeholder="Sala 8"
            items={poiList}
            onChanged={onOriginChanged}
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-black/50 select-none">Dokąd?</span>

        <SearchInput
          placeholder="Sala 8"
          items={poiList}
          onChanged={onDestinationChanged}
        />
      </label>
      <div></div>
      <button
        type="button"
        onClick={go}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-blue-600 font-semibold text-white transition duration-100 select-none active:scale-[0.98]"
      >
        GO
      </button>
    </GlowGlassCard>
  );
};

export default SearchMenu;
