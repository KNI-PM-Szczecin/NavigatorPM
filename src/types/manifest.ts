export interface BuildingManifest {
    id: string;
    name: string;
    description: string;
    address: string;
    isVisible?: boolean; }

export interface FloorManifest {
    id: string;
    buildingId: string;
    level: number;
    name: string;
    svgMapUrl: string;
    isVisible?: boolean; }

export interface NavigationNode {
    qrId: string;
    floorId: string;
    x: number;
    y: number;
    type: 'invisible' | 'poi' | 'room' | 'location' | 'connector';
    connections: string[];
    name?: string;
    shortName?: string;
    description?: string;
    iconName?: string;
    iconColor?: string;
    isNavigable?: boolean;
    translations?: Record<string, Record<string, string>>;
}
