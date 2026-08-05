export interface Building {
  id: string;
  address: string;
  isVisible: boolean;
}

export interface BuildingTranslation {
  buildingId: string;
  language: string;
  name: string;
  description: string | null;
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number;
  mapImageUrl: string;
  isVisible: boolean;
}

export interface FloorTranslation {
  floorId: string;
  language: string;
  name: string;
}

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
}

export interface POITranslation {
  poiId: string;
  language: string;
  name: string;
  description: string | null;
}

export interface MapData {
  buildings: Building[];
  buildingTranslations: BuildingTranslation[];
  floors: Floor[];
  floorTranslations: FloorTranslation[];
  nodes: Node[];
  edges: Edge[];
  pois: POI[];
  poiTranslations: POITranslation[];
}
