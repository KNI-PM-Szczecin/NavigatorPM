import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MapEditorClient } from '@/components/admin/MapEditorClient';
import { FloorManifest } from '@/types/manifest';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const floorId = (await params).id;
    const rawFloor = await data.getFloor(floorId);
    
    if (!rawFloor || !rawFloor.svgMapUrl) redirect(`/admin-portal-721/floor/${floorId}`);

    const floor: FloorManifest = {
        id: rawFloor.id,
        buildingId: rawFloor.buildingId,
        level: rawFloor.level,
        name: rawFloor.name,
        svgMapUrl: rawFloor.svgMapUrl
    };

    const initialNodes = await data.getNodes(floorId);
    const allFloors = await data.getFloors(floor.buildingId);
    const crossFloorTargets: any = {};

    await Promise.all(allFloors.map(async (f) => {
        if (f.id !== floorId) {
            const fNodes = await data.getNodes(f.id);
            crossFloorTargets[f.id] = {
                floorName: f.name,
                connectors: fNodes.filter(n => n.type === 'connector')
            };
        }
    }));

    return (
        <MapEditorClient 
            floor={floor}
            initialNodes={initialNodes}
            crossFloorTargets={crossFloorTargets}
            allFloors={allFloors}
        />
    );
}
