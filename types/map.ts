export interface Building {
  id: string;
  address: string;
  isVisible: boolean;
  translations: Translated<{ name: string }>;
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number;
  mapImageUrl: string;
  // [x, y, width, height] of the floor SVG's viewBox; node coordinates live in this space
  viewBox?: number[];
  translations: Translated<{ name: string }>;
}

export type Translated<T> = Partial<Record<AppLanguage, T>>;

export interface Node {
  id: string;
  floorId: string;
  xCoordinate: number;
  yCoordinate: number;
  type: string;
}

export interface Edge {
  id: string;
  nodeAId: string;
  nodeBId: string;
  weight: number;
  isAccessible: boolean;
}

export interface POI {
  id: string;
  nodeId: string;
  category: string;
  subCategory: string | null;
  translations: Translated<{ name: string; description: string | null }>;
}

export interface MapData {
  buildings: Building[];
  floors: Floor[];
  nodes: Node[];
  edges: Edge[];
  pois: POI[];
}

export type AppLanguage = "pl" | "en" | "uk";

export interface FloorInfo {
  id: string;
  level: number;
  mapImageUrl: string | null;
  viewBox: number[] | null;
  name: string;
}

export interface BuildingInfo {
  id: string;
  address: string;
  name: string;
  floors: FloorInfo[];
}

export interface PoiDetails {
  nodeId: string;
  floorId: string;
  buildingId?: string;
  mapImageUrl?: string | null;
  poiName?: string;
  poiDescription?: string | null;
  floorName?: string;
  floorLevel?: number;
  userX: number;
  userY: number;
  buildingName?: string;
}

export interface RouteSegment {
  floorId: string;
  path: string;
}

