#!/usr/bin/env node
/**
 * Migration script: converts between old JSON format and new SQLite format.
 *
 * Usage:
 *   node scripts/migrate.mjs to-sqlite   # Import data/ JSON files → navigator.db
 *   node scripts/migrate.mjs to-json     # Export navigator.db → data/ JSON files
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'navigator.db');
const DATA_DIR = path.join(ROOT, 'data');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// ---------------------------------------------------------------------------
// JSON → SQLite
// ---------------------------------------------------------------------------
function toSqlite() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('No data/ directory found. Nothing to migrate.');
        process.exit(1);
    }

    const buildingDirs = fs.readdirSync(DATA_DIR)
        .filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory());

    if (buildingDirs.length === 0) {
        console.log('data/ directory is empty. Nothing to migrate.');
        return;
    }

    const migrate = db.transaction(() => {
        for (const buildingId of buildingDirs) {
            const manifestPath = path.join(DATA_DIR, buildingId, 'manifest.json');
            if (!fs.existsSync(manifestPath)) continue;

            const b = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            db.prepare(`
                INSERT INTO buildings (id, name, description, address, is_visible)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name, description = excluded.description,
                    address = excluded.address, is_visible = excluded.is_visible
            `).run(b.id, b.name, b.description ?? '', b.address ?? '', b.isVisible ? 1 : 1);
            console.log(`Building: ${b.name}`);

            const floorDirs = fs.readdirSync(path.join(DATA_DIR, buildingId))
                .filter(f => fs.statSync(path.join(DATA_DIR, buildingId, f)).isDirectory());

            for (const floorId of floorDirs) {
                const floorManifest = path.join(DATA_DIR, buildingId, floorId, 'manifest.json');
                if (!fs.existsSync(floorManifest)) continue;

                const f = JSON.parse(fs.readFileSync(floorManifest, 'utf8'));
                const svgPath = path.join(DATA_DIR, buildingId, floorId, 'map.svg');
                const svgContent = fs.existsSync(svgPath) ? fs.readFileSync(svgPath) : null;
                const svgUrl = svgContent ? `/api/map/${floorId}` : '';

                db.prepare(`
                    INSERT INTO floors (id, building_id, level, name, svg_map_url, svg_content, is_visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        building_id = excluded.building_id, level = excluded.level,
                        name = excluded.name, svg_map_url = excluded.svg_map_url,
                        svg_content = excluded.svg_content, is_visible = excluded.is_visible
                `).run(f.id, f.buildingId, f.level, f.name, svgUrl, svgContent, f.isVisible ? 1 : 0);
                console.log(`  Floor: ${f.name}`);

                const nodesPath = path.join(DATA_DIR, buildingId, floorId, 'nodes.json');
                if (!fs.existsSync(nodesPath)) continue;

                const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
                for (const node of nodes) {
                    db.prepare(`
                        INSERT INTO nodes (qr_id, floor_id, x, y, type, connections, name, short_name, description, icon_name, icon_color, is_navigable)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(qr_id) DO UPDATE SET
                            floor_id = excluded.floor_id, x = excluded.x, y = excluded.y,
                            type = excluded.type, connections = excluded.connections,
                            name = excluded.name, short_name = excluded.short_name,
                            description = excluded.description, icon_name = excluded.icon_name,
                            icon_color = excluded.icon_color, is_navigable = excluded.is_navigable
                    `).run(
                        node.qrId, node.floorId ?? floorId,
                        node.x, node.y, node.type,
                        JSON.stringify(node.connections ?? []),
                        node.name ?? null, node.shortName ?? null, node.description ?? null,
                        node.iconName ?? null, node.iconColor ?? null,
                        node.isNavigable !== false ? 1 : 0
                    );

                    if (node.translations) {
                        for (const [locale, fields] of Object.entries(node.translations)) {
                            for (const [fieldName, translation] of Object.entries(fields)) {
                                db.prepare(`
                                    INSERT OR REPLACE INTO translations (entity_type, entity_id, locale, field_name, translation)
                                    VALUES ('node', ?, ?, ?, ?)
                                `).run(node.qrId, locale, fieldName, translation);
                            }
                        }
                    }
                }
                console.log(`    Nodes: ${nodes.length}`);
            }
        }
    });

    migrate();
    console.log('\nDone. All data imported into navigator.db.');
}

// ---------------------------------------------------------------------------
// SQLite → JSON
// ---------------------------------------------------------------------------
function toJson() {
    const buildings = db.prepare('SELECT * FROM buildings').all();

    if (buildings.length === 0) {
        console.log('No buildings in database. Nothing to export.');
        return;
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });

    for (const b of buildings) {
        const bDir = path.join(DATA_DIR, b.id);
        fs.mkdirSync(bDir, { recursive: true });

        fs.writeFileSync(path.join(bDir, 'manifest.json'), JSON.stringify({
            id: b.id, name: b.name, description: b.description ?? '',
            address: b.address ?? '', isVisible: Boolean(b.is_visible)
        }, null, 2));
        console.log(`Building: ${b.name}`);

        const floors = db.prepare('SELECT * FROM floors WHERE building_id = ? ORDER BY level').all(b.id);
        for (const f of floors) {
            const fDir = path.join(bDir, f.id);
            fs.mkdirSync(fDir, { recursive: true });

            fs.writeFileSync(path.join(fDir, 'manifest.json'), JSON.stringify({
                id: f.id, buildingId: f.building_id, level: f.level,
                name: f.name, svgMapUrl: f.svg_map_url ?? '',
                isVisible: Boolean(f.is_visible)
            }, null, 2));

            if (f.svg_content) {
                fs.writeFileSync(path.join(fDir, 'map.svg'), f.svg_content);
                console.log(`  Floor: ${f.name} (with SVG)`);
            } else {
                console.log(`  Floor: ${f.name} (no SVG)`);
            }

            const nodes = db.prepare('SELECT * FROM nodes WHERE floor_id = ?').all(f.id);
            const translationsRaw = nodes.length > 0
                ? db.prepare(`
                    SELECT entity_id, locale, field_name, translation
                    FROM translations WHERE entity_type = 'node' AND entity_id IN (${nodes.map(() => '?').join(',')})
                  `).all(nodes.map(n => n.qr_id))
                : [];

            const transMap = {};
            for (const row of translationsRaw) {
                if (!transMap[row.entity_id]) transMap[row.entity_id] = {};
                if (!transMap[row.entity_id][row.locale]) transMap[row.entity_id][row.locale] = {};
                transMap[row.entity_id][row.locale][row.field_name] = row.translation;
            }

            const nodesJson = nodes.map(n => ({
                qrId: n.qr_id, floorId: n.floor_id,
                x: n.x, y: n.y, type: n.type,
                connections: JSON.parse(n.connections ?? '[]'),
                ...(n.name && { name: n.name }),
                ...(n.short_name && { shortName: n.short_name }),
                ...(n.description && { description: n.description }),
                ...(n.icon_name && { iconName: n.icon_name }),
                ...(n.icon_color && { iconColor: n.icon_color }),
                isNavigable: Boolean(n.is_navigable),
                ...(transMap[n.qr_id] && { translations: transMap[n.qr_id] })
            }));

            fs.writeFileSync(path.join(fDir, 'nodes.json'), JSON.stringify(nodesJson, null, 2));
            console.log(`    Nodes: ${nodes.length}`);
        }
    }

    console.log('\nDone. Data exported to data/');
}

// ---------------------------------------------------------------------------
const command = process.argv[2];
if (command === 'to-sqlite') toSqlite();
else if (command === 'to-json') toJson();
else {
    console.log('Usage:');
    console.log('  node scripts/migrate.mjs to-sqlite   # JSON files → SQLite');
    console.log('  node scripts/migrate.mjs to-json     # SQLite → JSON files');
    process.exit(1);
}
