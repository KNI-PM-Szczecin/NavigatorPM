import db from './db';
import { BuildingManifest, FloorManifest, NavigationNode } from '@/types/manifest';

export function getAllBuildings(): BuildingManifest[] {
    return (db.prepare('SELECT * FROM buildings ORDER BY name').all() as any[]).map(rowToBuilding);
}

export function saveBuilding(building: BuildingManifest) {
    db.prepare(`
        INSERT INTO buildings (id, name, description, address, is_visible)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            address = excluded.address,
            is_visible = excluded.is_visible
    `).run(building.id, building.name, building.description ?? '', building.address ?? '', building.isVisible ? 1 : 0);
}

export function deleteBuilding(id: string) {
    const floors = db.prepare('SELECT id FROM floors WHERE building_id = ?').all(id) as any[];
    for (const floor of floors) {
        deleteFloor(floor.id);
    }
    db.prepare("DELETE FROM translations WHERE entity_type = 'building' AND entity_id = ?").run(id);
    db.prepare('DELETE FROM buildings WHERE id = ?').run(id);
}

export function getFloors(buildingId: string): FloorManifest[] {
    return (db.prepare('SELECT * FROM floors WHERE building_id = ? ORDER BY level').all(buildingId) as any[]).map(rowToFloor);
}

export function getFloor(floorId: string): FloorManifest | null {
    const row = db.prepare('SELECT * FROM floors WHERE id = ?').get(floorId) as any;
    return row ? rowToFloor(row) : null;
}

export function saveFloor(floor: FloorManifest, svgBuffer?: Buffer) {
    const existing = db.prepare('SELECT svg_content FROM floors WHERE id = ?').get(floor.id) as any;
    const svgUrl = svgBuffer ? `/api/map/${floor.id}` : floor.svgMapUrl;
    const svgContent = svgBuffer ?? existing?.svg_content ?? null;

    db.prepare(`
        INSERT INTO floors (id, building_id, level, name, svg_map_url, svg_content, is_visible)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            building_id = excluded.building_id,
            level = excluded.level,
            name = excluded.name,
            svg_map_url = excluded.svg_map_url,
            svg_content = excluded.svg_content,
            is_visible = excluded.is_visible
    `).run(floor.id, floor.buildingId, floor.level, floor.name, svgUrl, svgContent, floor.isVisible ? 1 : 0);
}

export function deleteFloor(floorId: string) {
    const nodes = db.prepare('SELECT qr_id FROM nodes WHERE floor_id = ?').all(floorId) as any[];
    for (const node of nodes) {
        db.prepare("DELETE FROM translations WHERE entity_type = 'node' AND entity_id = ?").run(node.qr_id);
    }
    db.prepare('DELETE FROM nodes WHERE floor_id = ?').run(floorId);
    db.prepare("DELETE FROM translations WHERE entity_type = 'floor' AND entity_id = ?").run(floorId);
    db.prepare('DELETE FROM floors WHERE id = ?').run(floorId);
}

export function getNodes(floorId: string): NavigationNode[] {
    return (db.prepare('SELECT * FROM nodes WHERE floor_id = ?').all(floorId) as any[]).map(rowToNode);
}

export function saveNodes(floorId: string, nodes: NavigationNode[]) {
    const save = db.transaction(() => {
        db.prepare('DELETE FROM nodes WHERE floor_id = ?').run(floorId);
        for (const node of nodes) {
            db.prepare(`
                INSERT INTO nodes (qr_id, floor_id, x, y, type, connections, name, short_name, description, icon_name, icon_color, is_navigable)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                node.qrId, node.floorId ?? floorId,
                node.x, node.y, node.type,
                JSON.stringify(node.connections ?? []),
                node.name ?? null, node.shortName ?? null, node.description ?? null,
                node.iconName ?? null, node.iconColor ?? null,
                node.isNavigable !== false ? 1 : 0
            );

            // Preserve embedded translations if present (from migration or editor)
            if (node.translations) {
                for (const [locale, fields] of Object.entries(node.translations as Record<string, Record<string, string>>)) {
                    for (const [fieldName, translation] of Object.entries(fields)) {
                        db.prepare(`
                            INSERT OR REPLACE INTO translations (entity_type, entity_id, locale, field_name, translation)
                            VALUES ('node', ?, ?, ?, ?)
                        `).run(node.qrId, locale, fieldName, translation);
                    }
                }
            }
        }
    });
    save();
}

function rowToBuilding(row: any): BuildingManifest {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        address: row.address ?? '',
        isVisible: Boolean(row.is_visible)
    };
}

function rowToFloor(row: any): FloorManifest {
    return {
        id: row.id,
        buildingId: row.building_id,
        level: row.level,
        name: row.name,
        svgMapUrl: row.svg_map_url ?? '',
        isVisible: Boolean(row.is_visible)
    };
}

function rowToNode(row: any): NavigationNode {
    return {
        qrId: row.qr_id,
        floorId: row.floor_id,
        x: row.x,
        y: row.y,
        type: row.type,
        connections: JSON.parse(row.connections ?? '[]'),
        name: row.name ?? undefined,
        shortName: row.short_name ?? undefined,
        description: row.description ?? undefined,
        iconName: row.icon_name ?? undefined,
        iconColor: row.icon_color ?? undefined,
        isNavigable: Boolean(row.is_navigable)
    };
}
