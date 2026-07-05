"use server";

import db from './db';
import * as data from './data';
import bcrypt from 'bcryptjs';
import { logout } from './auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function resetSystemToDefaults() {
    db.prepare('DELETE FROM settings').run();
    db.prepare('DELETE FROM admin').run();
    db.prepare('DELETE FROM translations').run();
    data.getAllBuildings().forEach(b => data.deleteBuilding(b.id));
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', hash);
    await logout();
    redirect('/admin-portal-721');
}

export async function handleLogout() {
    await logout();
    redirect('/admin-portal-721');
}

export async function changePassword(newPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    db.prepare('UPDATE admin SET password_hash = ? WHERE username = ?').run(hash, 'admin');
}

export async function saveTranslation(entityType: string, entityId: string, locale: string, fieldName: string, translation: string) {
    db.prepare(`
        INSERT OR REPLACE INTO translations (entity_type, entity_id, locale, field_name, translation)
        VALUES (?, ?, ?, ?, ?)
    `).run(entityType, entityId, locale, fieldName, translation);
}

export async function addBuildingAction(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const isVisible = formData.get('isVisible') === 'true';

    data.saveBuilding({ id, name, description, address, isVisible });
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function saveBuildingAction(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const isVisible = formData.get('isVisible') === 'true';

    data.saveBuilding({ id, name, description, address, isVisible });
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function deleteBuildingAction(id: string) {
    data.deleteBuilding(id);
    revalidatePath('/admin-portal-721/buildings');
    revalidatePath('/');
}

export async function addFloorAction(buildingId: string, formData: FormData) {
    const level = parseInt(formData.get('level') as string);
    const name = formData.get('name') as string;
    const id = `${buildingId}-F${level}`;
    
    data.saveFloor({ id, buildingId, level, name, svgMapUrl: '', isVisible: false });
    revalidatePath(`/admin-portal-721/buildings/${buildingId}/floors`);
}

export async function updateFloorAction(floorId: string, formData: FormData) {
    const floor = data.getFloor(floorId);
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

    data.saveFloor(floor, svgBuffer);
    revalidatePath(`/admin-portal-721/floor/${floorId}`);
    revalidatePath(`/admin-portal-721/buildings/${floor.buildingId}/floors`);
    revalidatePath('/');
}

export async function deleteFloorAction(id: string) {
    const [bId] = id.split('-F');
    data.deleteFloor(id);
    revalidatePath(`/admin-portal-721/buildings/${bId}/floors`);
    revalidatePath('/');
}

export async function saveNodesAction(floorId: string, nodes: any[]) {
        data.saveNodes(floorId, nodes);

                for (const node of nodes) {
        for (const connId of node.connections) {
            if (!connId.startsWith(floorId)) {
                                const targetFloorId = connId.split('-').slice(0, 2).join('-');
                const targetNodes = data.getNodes(targetFloorId);
                const targetNode = targetNodes.find(n => n.qrId === connId);
                
                if (targetNode && !targetNode.connections.includes(node.qrId)) {
                    targetNode.connections.push(node.qrId);
                    data.saveNodes(targetFloorId, targetNodes);
                }
            }
        }
    }

    revalidatePath(`/admin-portal-721/editor/${floorId}`);
}

export async function cloneFloorData(sourceFloorId: string, targetFloorId: string, mode: 'overwrite' | 'merge') {
    const sourceNodes = data.getNodes(sourceFloorId);
    const targetFloor = data.getFloor(targetFloorId);
    if (!targetFloor) return;

    let targetNodes = mode === 'overwrite' ? [] : data.getNodes(targetFloorId);

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

    data.saveNodes(targetFloorId, targetNodes);
    revalidatePath(`/admin-portal-721/editor/${targetFloorId}`);
}
