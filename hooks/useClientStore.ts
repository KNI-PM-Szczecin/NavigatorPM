import { create } from "zustand";

export type ClientUiMode = "EXPLORE" | "ROUTING" | "POI_DETAILS" | "SETTINGS";

interface ClientState {
  mode: ClientUiMode;
  setMode: (mode: ClientUiMode) => void;

  // Nawigacja i POI
  activeFloorId: string | null;
  setActiveFloorId: (id: string) => void;

  selectedPoiId: string | null;
  setSelectedPoiId: (id: string | null) => void;

  originPoiId: string | null;
  setOriginPoiId: (id: string | null) => void;

  destinationPoiId: string | null;
  setDestinationPoiId: (id: string | null) => void;

  // Opcje routingu
  preferElevators: boolean;
  togglePreferElevators: () => void;

  // Wyczyść trasę i wróć do eksploracji
  resetNavigation: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  mode: "EXPLORE",
  setMode: (mode) => set({ mode }),

  activeFloorId: null,
  setActiveFloorId: (id) => set({ activeFloorId: id }),

  selectedPoiId: null,
  setSelectedPoiId: (id) =>
    set({ selectedPoiId: id, mode: id ? "POI_DETAILS" : "EXPLORE" }),

  originPoiId: null,
  setOriginPoiId: (id) => set({ originPoiId: id }),

  destinationPoiId: null,
  setDestinationPoiId: (id) => set({ destinationPoiId: id }),

  preferElevators: false,
  togglePreferElevators: () =>
    set((state) => ({ preferElevators: !state.preferElevators })),

  resetNavigation: () =>
    set({
      mode: "EXPLORE",
      originPoiId: null,
      destinationPoiId: null,
      selectedPoiId: null,
    }),
}));
