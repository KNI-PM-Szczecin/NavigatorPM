import { FloorInfo } from "@/types/map";

interface FloorControlsProps {
  floors: FloorInfo[];
  activeFloorId: string | null;
  onFloorChange: (floorId: string) => void;
  destinationFloorId?: string | null;
}

export default function FloorControls({
  floors,
  activeFloorId,
  onFloorChange,
  destinationFloorId,
}: FloorControlsProps) {
  if (floors.length <= 1) return null;

  // Kolejność jak w windzie: najwyższe piętro u góry, najniższe na dole
  const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

  return (
    <div
      aria-label="Wybór piętra"
      className="pointer-events-auto fixed top-1/2 right-3 sm:right-4 z-40 flex -translate-y-1/2 flex-col gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl select-none"
    >
      {sortedFloors.map((f) => {
        const isDestinationFloor = destinationFloorId && f.id === destinationFloorId;
        const isActive = f.id === activeFloorId;

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onFloorChange(f.id)}
            aria-label={`Przejdź na piętro ${f.level}${isDestinationFloor ? " (Piętro docelowe)" : ""}`}
            className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm font-bold transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.65)] scale-105"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white active:scale-95"
            }`}
          >
            {f.level}

            {/* Wskaźnik celu podróży (Badge z czerwoną kropką) */}
            {isDestinationFloor && (
              <span
                title="Piętro z celem podróży"
                className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-zinc-950" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
