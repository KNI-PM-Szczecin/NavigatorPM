import fs from 'fs';
import path from 'path';
import prisma from './db';
import { BuildingManifest, FloorManifest, NavigationNode } from '@/types/manifest';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function getAllBuildings(): Promise<BuildingManifest[]> {
    const buildings = await prisma.building.findMany({
        include: { translations: true }
    });
    return buildings.map(b => {
        const trans = b.translations.find(t => t.language.startsWith('pl')) || b.translations[0];
        return {
            id: b.id,
            name: trans ? trans.name : b.id,
            description: trans ? (trans.description || '') : '',
            address: b.address || '',
            isVisible: b.isVisible
        };
    });
}

export async function saveBuilding(building: BuildingManifest) {
    await prisma.building.upsert({
        where: { id: building.id },
        update: {
            address: building.address,
            isVisible: building.isVisible ?? true
        },
        create: {
            id: building.id,
            address: building.address,
            isVisible: building.isVisible ?? true
        }
    });

    await prisma.buildingTranslation.upsert({
        where: {
            buildingId_language: {
                buildingId: building.id,
                language: 'pl'
            }
        },
        update: {
            name: building.name,
            description: building.description
        },
        create: {
            buildingId: building.id,
            language: 'pl',
            name: building.name,
            description: building.description
        }
    });
}

export async function deleteBuilding(id: string) {
    await prisma.building.delete({ where: { id } }).catch(() => {});
}

export async function getFloors(buildingId: string): Promise<FloorManifest[]> {
    const floors = await prisma.floor.findMany({
        where: { buildingId },
        include: { translations: true }
    });
    return floors.map(f => {
        const trans = f.translations.find(t => t.language.startsWith('pl')) || f.translations[0];
        return {
            id: f.id,
            buildingId: f.buildingId,
            level: f.level,
            name: trans ? trans.name : f.id,
            svgMapUrl: f.mapImageUrl || '',
            isVisible: f.isVisible
        };
    });
}

export async function getFloor(floorId: string): Promise<FloorManifest | null> {
    const f = await prisma.floor.findUnique({
        where: { id: floorId },
        include: { translations: true }
    });
    if (!f) return null;
    const trans = f.translations.find(t => t.language.startsWith('pl')) || f.translations[0];
    return {
        id: f.id,
        buildingId: f.buildingId,
        level: f.level,
        name: trans ? trans.name : f.id,
        svgMapUrl: f.mapImageUrl || '',
        isVisible: f.isVisible
    };
}

export async function saveFloor(floor: FloorManifest, svgBuffer?: Buffer) {
    let mapImageUrl = floor.svgMapUrl;
    
    if (svgBuffer) {
        const [bId] = floor.id.split('-F');
        const fDir = path.join(DATA_DIR, bId, floor.id);
        if (!fs.existsSync(fDir)) {
            fs.mkdirSync(fDir, { recursive: true });
        }
        fs.writeFileSync(path.join(fDir, 'map.svg'), svgBuffer);
        mapImageUrl = `/api/map/${floor.id}`;
    }

    await prisma.floor.upsert({
        where: { id: floor.id },
        update: {
            buildingId: floor.buildingId,
            level: floor.level,
            mapImageUrl: mapImageUrl,
            isVisible: floor.isVisible ?? true
        },
        create: {
            id: floor.id,
            buildingId: floor.buildingId,
            level: floor.level,
            mapImageUrl: mapImageUrl,
            isVisible: floor.isVisible ?? true
        }
    });

    await prisma.floorTranslation.upsert({
        where: {
            floorId_language: {
                floorId: floor.id,
                language: 'pl'
            }
        },
        update: {
            name: floor.name
        },
        create: {
            floorId: floor.id,
            language: 'pl',
            name: floor.name
        }
    });
}

export async function deleteFloor(id: string) {
    await prisma.floor.delete({ where: { id } }).catch(() => {});
}

export async function getNodes(floorId: string): Promise<NavigationNode[]> {
    const nodes = await prisma.node.findMany({
        where: { floorId },
        include: {
            poi: {
                include: {
                    translations: true
                }
            },
            edgesA: true,
            edgesB: true
        }
    });

    return nodes.map(n => {
        // Zbieramy połączenia (krawędzie)
        const connections: string[] = [];
        n.edgesA.forEach(e => connections.push(e.nodeBId));
        n.edgesB.forEach(e => connections.push(e.nodeAId));

        // Zbieramy tłumaczenia POI
        const translations: Record<string, Record<string, string>> = {};
        let defaultName = '';
        let defaultDesc = '';

        if (n.poi) {
            n.poi.translations.forEach(t => {
                translations[t.language] = {
                    name: t.name,
                    description: t.description,
                    shortName: t.name
                };
            });

            const defaultTrans = n.poi.translations.find(t => t.language.startsWith('pl')) || n.poi.translations[0];
            if (defaultTrans) {
                defaultName = defaultTrans.name;
                defaultDesc = defaultTrans.description;
            }
        }

        return {
            qrId: n.id,
            floorId: n.floorId,
            x: n.xCoordinate,
            y: n.yCoordinate,
            type: n.type as any,
            connections,
            translations,
            name: defaultName,
            shortName: defaultName,
            description: defaultDesc
        };
    });
}

export async function saveNodes(floorId: string, nodes: NavigationNode[]) {
    // Usunięcie istniejących węzłów (kaskadowo usuwa powiązane krawędzie i POI)
    const existingNodes = await prisma.node.findMany({
        where: { floorId }
    });
    const existingNodeIds = existingNodes.map(n => n.id);

    if (existingNodeIds.length > 0) {
        // Usuwamy krawędzie przed usunięciem węzłów
        await prisma.edge.deleteMany({
            where: {
                OR: [
                    { nodeAId: { in: existingNodeIds } },
                    { nodeBId: { in: existingNodeIds } }
                ]
            }
        });
        
        await prisma.node.deleteMany({
            where: { floorId }
        });
    }

    // Zapis nowych węzłów
    for (const node of nodes) {
        const hasPoi = node.type === 'poi' || node.type === 'room' || node.name || node.translations;
        
        await prisma.node.create({
            data: {
                id: node.qrId,
                floorId: floorId,
                xCoordinate: node.x,
                yCoordinate: node.y,
                type: node.type,
                ...(hasPoi ? {
                    poi: {
                        create: {
                            id: node.qrId,
                            category: node.type === 'room' ? 'ROOM' : 'POI',
                            subCategory: 'NONE',
                            translations: {
                                create: Object.entries(node.translations || {}).map(([lang, fields]) => ({
                                    language: lang,
                                    name: fields.name || node.name || '',
                                    description: fields.description || node.description || ''
                                }))
                            }
                        }
                    }
                } : {})
            }
        });
    }

    // Zbieramy unikalne krawędzie
    const edgesToInsert = new Map<string, { nodeAId: string, nodeBId: string }>();
    
    nodes.forEach(node => {
        const nodeAId = node.qrId;
        (node.connections || []).forEach(connId => {
            if (nodeAId === connId) return;
            const edgeKey = nodeAId < connId ? `${nodeAId}_${connId}` : `${connId}_${nodeAId}`;
            edgesToInsert.set(edgeKey, {
                nodeAId: nodeAId < connId ? nodeAId : connId,
                nodeBId: nodeAId < connId ? connId : nodeAId
            });
        });
    });

    // Zapis krawędzi
    for (const [key, edge] of edgesToInsert.entries()) {
        const nodeAExists = await prisma.node.findUnique({ where: { id: edge.nodeAId } });
        const nodeBExists = await prisma.node.findUnique({ where: { id: edge.nodeBId } });

        if (nodeAExists && nodeBExists) {
            await prisma.edge.upsert({
                where: { id: key },
                update: {},
                create: {
                    id: key,
                    nodeAId: edge.nodeAId,
                    nodeBId: edge.nodeBId,
                    weight: 1.0,
                    isAccessible: true
                }
            });
        }
    }
}
