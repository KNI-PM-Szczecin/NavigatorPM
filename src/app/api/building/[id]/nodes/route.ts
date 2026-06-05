import { NextResponse } from 'next/server';
import * as data from '@/lib/data';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const buildingId = (await params).id;
    const floors = await data.getFloors(buildingId);
    
    const allNodes = (await Promise.all(floors.map(f => data.getNodes(f.id)))).flat();

    const floorIds = floors.map(f => f.id);
    const floorTranslationsRaw = floorIds.length > 0
        ? await db.floorTranslation.findMany({
            where: {
                floorId: { in: floorIds }
            }
        })
        : [];

    const floorTranslationsMap: Record<string, Record<string, string>> = {};
    floorTranslationsRaw.forEach(row => {
        if (!floorTranslationsMap[row.floorId]) floorTranslationsMap[row.floorId] = {};
        floorTranslationsMap[row.floorId][row.language] = row.name;
    });

    const floorsWithTranslations = floors.map(f => ({
        ...f,
        translations: floorTranslationsMap[f.id] || {}
    }));
    
    return NextResponse.json({
        floors: floorsWithTranslations,
        nodes: allNodes
    });
}
