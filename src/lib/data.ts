import fs from 'fs';
import path from 'path';
import { BuildingManifest, FloorManifest, NavigationNode } from '@/types/manifest';

const DATA_DIR = path.join(process.cwd(), 'data');

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};


export function getAllBuildings(): BuildingManifest[] {
    ensureDir(DATA_DIR);
    const dirs = fs.readdirSync(DATA_DIR).filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory());
    return dirs.map(id => {
        const manifestPath = path.join(DATA_DIR, id, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        }
        return { id, name: id, description: '', address: '' };
    });
}

export function saveBuilding(building: BuildingManifest) {
    const bDir = path.join(DATA_DIR, building.id);
    ensureDir(bDir);
    fs.writeFileSync(path.join(bDir, 'manifest.json'), JSON.stringify(building, null, 2));
}

export function deleteBuilding(id: string) {
    const bDir = path.join(DATA_DIR, id);
    if (fs.existsSync(bDir)) {
        fs.rmSync(bDir, { recursive: true, force: true });
    }
}


export function getFloors(buildingId: string): FloorManifest[] {
    const bDir = path.join(DATA_DIR, buildingId);
    if (!fs.existsSync(bDir)) return [];
    
    const dirs = fs.readdirSync(bDir).filter(f => fs.statSync(path.join(bDir, f)).isDirectory());
    return dirs.map(fDir => {
        const manifestPath = path.join(bDir, fDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                                    return data;
        }
        return null;
    }).filter(Boolean) as FloorManifest[];
}

export function getFloor(floorId: string): FloorManifest | null {
    const [bId] = floorId.split('-F');
    const fPath = path.join(DATA_DIR, bId, floorId, 'manifest.json');
    if (fs.existsSync(fPath)) {
        return JSON.parse(fs.readFileSync(fPath, 'utf8'));
    }
    return null;
}

export function saveFloor(floor: FloorManifest, svgBuffer?: Buffer) {
    const fDir = path.join(DATA_DIR, floor.buildingId, floor.id);
    ensureDir(fDir);
    
    if (svgBuffer) {
        fs.writeFileSync(path.join(fDir, 'map.svg'), svgBuffer);
        floor.svgMapUrl = `/api/map/${floor.id}`;     }
    
    fs.writeFileSync(path.join(fDir, 'manifest.json'), JSON.stringify(floor, null, 2));
}


export function getNodes(floorId: string): NavigationNode[] {
    const [bId] = floorId.split('-F');
    const nPath = path.join(DATA_DIR, bId, floorId, 'nodes.json');
    if (fs.existsSync(nPath)) {
        return JSON.parse(fs.readFileSync(nPath, 'utf8'));
    }
    return [];
}

export function saveNodes(floorId: string, nodes: NavigationNode[]) {
    const [bId] = floorId.split('-F');
    const fDir = path.join(DATA_DIR, bId, floorId);
    ensureDir(fDir);
    fs.writeFileSync(path.join(fDir, 'nodes.json'), JSON.stringify(nodes, null, 2));
}
