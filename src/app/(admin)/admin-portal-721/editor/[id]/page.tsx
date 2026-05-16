import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MapEditorClient } from '@/components/admin/MapEditorClient';
import { FloorManifest } from '@/types/manifest';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }: { params: { id: string } }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const floorId = (await params).id;
    const rawFloor = data.getFloor(floorId);
    
    if (!rawFloor || !rawFloor.svgMapUrl) redirect(`/admin-portal-721/floor/${floorId}`);

    const floor: FloorManifest = {
        id: rawFloor.id,
        buildingId: rawFloor.buildingId,
        level: rawFloor.level,
        name: rawFloor.name,
        svgMapUrl: rawFloor.svgMapUrl
    };

    const initialNodesRaw = data.getNodes(floorId);
    
        const nodeIds = initialNodesRaw.map(n => n.qrId);
    const nodeTranslationsRaw = nodeIds.length > 0 
        ? db.prepare(`SELECT entity_id, locale, field_name, translation FROM translations WHERE entity_type = 'node' AND entity_id IN (${nodeIds.map(() => '?').join(',')})`).all(nodeIds) as any[]
        : [];

    const nodeTranslationsMap: Record<string, Record<string, Record<string, string>>> = {};
    nodeTranslationsRaw.forEach(row => {
        if (!nodeTranslationsMap[row.entity_id]) nodeTranslationsMap[row.entity_id] = {};
        if (!nodeTranslationsMap[row.entity_id][row.locale]) nodeTranslationsMap[row.entity_id][row.locale] = {};
        nodeTranslationsMap[row.entity_id][row.locale][row.field_name] = row.translation;
    });

    const initialNodes = initialNodesRaw.map(n => ({
        ...n,
        translations: nodeTranslationsMap[n.qrId] || {}
    }));

        const allFloors = data.getFloors(floor.buildingId);
    const crossFloorTargets: any = {};

    allFloors.forEach(f => {
        if (f.id !== floorId) {
            const fNodes = data.getNodes(f.id);
            crossFloorTargets[f.id] = {
                floorName: f.name,
                connectors: fNodes.filter(n => n.type === 'connector')
            };
        }
    });

    return (
        <MapEditorClient 
            floor={floor}
            initialNodes={initialNodes}
            crossFloorTargets={crossFloorTargets}
            allFloors={allFloors}
        />
    );
}
