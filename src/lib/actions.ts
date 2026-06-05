"use server";

import prisma from './db';
import * as data from './data';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function resetSystemToDefaults() {
    await prisma.pOITranslation.deleteMany();
    await prisma.pOI.deleteMany();
    await prisma.edge.deleteMany();
    await prisma.node.deleteMany();
    await prisma.floorTranslation.deleteMany();
    await prisma.floor.deleteMany();
    await prisma.buildingTranslation.deleteMany();
    await prisma.building.deleteMany();

    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
    }

    redirect('/admin-portal-721/buildings');
}

export async function saveTranslation(entityType: string, entityId: string, locale: string, fieldName: string, translation: string) {
    if (entityType === 'building') {
        await prisma.buildingTranslation.upsert({
            where: {
                buildingId_language: {
                    buildingId: entityId,
                    language: locale
                }
            },
            update: {
                name: translation
            },
            create: {
                buildingId: entityId,
                language: locale,
                name: translation
            }
        });
    } else if (entityType === 'floor') {
        await prisma.floorTranslation.upsert({
            where: {
                floorId_language: {
                    floorId: entityId,
                    language: locale
                }
            },
            update: {
                name: translation
            },
            create: {
                floorId: entityId,
                language: locale,
                name: translation
            }
        });
    } else if (entityType === 'node') {
        let poi = await prisma.pOI.findUnique({
            where: { nodeId: entityId }
        });
        if (!poi) {
            const node = await prisma.node.findUnique({ where: { id: entityId } });
            poi = await prisma.pOI.create({
                data: {
                    id: entityId,
                    nodeId: entityId,
                    category: node?.type === 'room' ? 'ROOM' : 'POI',
                    subCategory: 'NONE'
                }
            });
        }
        
        await prisma.pOITranslation.upsert({
            where: {
                poiId_language: {
                    poiId: poi.id,
                    language: locale
                }
            },
            update: {
                name: fieldName === 'name' ? translation : undefined,
                description: fieldName === 'description' ? translation : undefined
            },
            create: {
                poiId: poi.id,
                language: locale,
                name: fieldName === 'name' ? translation : '',
                description: fieldName === 'description' ? translation : ''
            }
        });
    }
}

export async function addBuildingAction(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const isVisible = formData.get('isVisible') === 'true';

    await data.saveBuilding({ id, name, description, address, isVisible });
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function saveBuildingAction(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const isVisible = formData.get('isVisible') === 'true';

    await data.saveBuilding({ id, name, description, address, isVisible });
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function deleteBuildingAction(id: string) {
    await data.deleteBuilding(id);
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function addFloorAction(buildingId: string, formData: FormData) {
    const level = parseInt(formData.get('level') as string);
    const name = formData.get('name') as string;
    const id = `${buildingId}-F${level}`;
    
    await data.saveFloor({ id, buildingId, level, name, svgMapUrl: '', isVisible: false });
    revalidatePath(`/admin-portal-721/buildings/${buildingId}/floors`);
}

export async function updateFloorAction(floorId: string, formData: FormData) {
    const floor = await data.getFloor(floorId);
    if (!floor) return;

    let svgBuffer: Buffer | undefined;
    const svgFile = formData.get('svgFile') as File;
    const svgUrl = formData.get('svgUrl') as string;
    const isVisible = formData.get('isVisible') === 'true';

    if (svgFile && svgFile.size > 0) {
        svgBuffer = Buffer.from(await svgFile.arrayBuffer());
    } else if (svgUrl) {
        floor.svgMapUrl = svgUrl;
    }

    floor.isVisible = isVisible;

    await data.saveFloor(floor, svgBuffer);
    revalidatePath(`/admin-portal-721/floor/${floorId}`);
    revalidatePath(`/admin-portal-721/buildings/${floor.buildingId}/floors`);
    revalidatePath('/');
}

export async function deleteFloorAction(id: string) {
    const [bId] = id.split('-F');
    const fDir = require('path').join(process.cwd(), 'data', bId, id);
    if (require('fs').existsSync(fDir)) {
        require('fs').rmSync(fDir, { recursive: true, force: true });
    }
    await data.deleteFloor(id);
    revalidatePath(`/admin-portal-721/buildings/${bId}/floors`);
    revalidatePath('/');
}

export async function saveNodesAction(floorId: string, nodes: any[]) {
    await data.saveNodes(floorId, nodes);

    for (const node of nodes) {
        for (const connId of node.connections) {
            if (!connId.startsWith(floorId)) {
                const targetFloorId = connId.split('-').slice(0, 2).join('-');
                const targetNodes = await data.getNodes(targetFloorId);
                const targetNode = targetNodes.find(n => n.qrId === connId);
                
                if (targetNode && !targetNode.connections.includes(node.qrId)) {
                    targetNode.connections.push(node.qrId);
                    await data.saveNodes(targetFloorId, targetNodes);
                }
            }
        }
    }

    revalidatePath(`/admin-portal-721/editor/${floorId}`);
}

export async function cloneFloorData(sourceFloorId: string, targetFloorId: string, mode: 'overwrite' | 'merge') {
    const sourceNodes = await data.getNodes(sourceFloorId);
    const targetFloor = await data.getFloor(targetFloorId);
    if (!targetFloor) return;

    let targetNodes = mode === 'overwrite' ? [] : await data.getNodes(targetFloorId);

    const newNodes = sourceNodes.map(node => {
        const nodeNumber = node.qrId.split('-').pop();
        const newQrId = `${targetFloorId}-${nodeNumber}`;
        const newConnections = node.connections.map(c => {
            const cNum = c.split('-').pop();
            return `${targetFloorId}-${cNum}`;
        });

        return { ...node, qrId: newQrId, floorId: targetFloorId, connections: newConnections };
    });

    if (mode === 'merge') {
        const existingIds = new Set(targetNodes.map(n => n.qrId));
        newNodes.forEach(n => {
            if (!existingIds.has(n.qrId)) targetNodes.push(n);
        });
    } else {
        targetNodes = newNodes;
    }

    await data.saveNodes(targetFloorId, targetNodes);
    revalidatePath(`/admin-portal-721/editor/${targetFloorId}`);
}
