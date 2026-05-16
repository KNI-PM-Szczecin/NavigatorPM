import { NextResponse } from 'next/server';
import * as data from '@/lib/data';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const buildingId = (await params).id;
    const floors = data.getFloors(buildingId);
    
        const allNodesRaw = floors.flatMap(f => data.getNodes(f.id));

        const nodeIds = allNodesRaw.map(n => n.qrId);
    const nodeTranslationsRaw = nodeIds.length > 0 
        ? db.prepare(`SELECT entity_id, locale, field_name, translation FROM translations WHERE entity_type = 'node' AND entity_id IN (${nodeIds.map(() => '?').join(',')})`).all(nodeIds) as any[]
        : [];
    
    const nodeTranslationsMap: Record<string, Record<string, Record<string, string>>> = {};
    nodeTranslationsRaw.forEach(row => {
        if (!nodeTranslationsMap[row.entity_id]) nodeTranslationsMap[row.entity_id] = {};
        if (!nodeTranslationsMap[row.entity_id][row.locale]) nodeTranslationsMap[row.entity_id][row.locale] = {};
        nodeTranslationsMap[row.entity_id][row.locale][row.field_name] = row.translation;
    });

    const allNodes = allNodesRaw.map(n => ({
        ...n,
        translations: nodeTranslationsMap[n.qrId] || {}
    }));

        const floorsWithTranslations = floors.map(f => {
        const transRaw = db.prepare("SELECT locale, translation FROM translations WHERE entity_type = 'floor' AND field_name = 'name' AND entity_id = ?").all(f.id) as any[];
        const translations: Record<string, string> = {};
        transRaw.forEach(row => translations[row.locale] = row.translation);
        
        return {
            id: f.id,
            level: f.level,
            name: f.name,
            svgMapUrl: f.svgMapUrl,
            translations
        };
    });
    
    return NextResponse.json({
        floors: floorsWithTranslations,
        nodes: allNodes
    });
}
