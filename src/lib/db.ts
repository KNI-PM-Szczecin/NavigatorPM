import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'navigator.db');
const db = new Database(dbPath, { timeout: 5000 });

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const runMigration = (sql: string) => {
    try { db.exec(sql); } catch (_) { /* column already exists */ }
};

try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        is_visible INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS floors (
        id TEXT PRIMARY KEY,
        building_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        name TEXT NOT NULL,
        svg_map_url TEXT,
        svg_content BLOB,
        is_visible INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (building_id) REFERENCES buildings (id)
      );

      CREATE TABLE IF NOT EXISTS nodes (
        qr_id TEXT PRIMARY KEY,
        floor_id TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        type TEXT NOT NULL,
        connections TEXT NOT NULL DEFAULT '[]',
        name TEXT,
        short_name TEXT,
        description TEXT,
        icon_name TEXT,
        icon_color TEXT,
        is_navigable INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (floor_id) REFERENCES floors (id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        locale TEXT NOT NULL,
        field_name TEXT NOT NULL,
        translation TEXT NOT NULL,
        UNIQUE(entity_type, entity_id, locale, field_name)
      );
    `);

    // Migrations for existing databases
    runMigration('ALTER TABLE buildings ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1');
    runMigration('ALTER TABLE floors ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 0');
    runMigration('ALTER TABLE floors ADD COLUMN svg_content BLOB');
    runMigration('ALTER TABLE nodes ADD COLUMN name TEXT');
    runMigration('ALTER TABLE nodes ADD COLUMN short_name TEXT');
    runMigration('ALTER TABLE nodes ADD COLUMN description TEXT');
    runMigration('ALTER TABLE nodes ADD COLUMN is_navigable INTEGER NOT NULL DEFAULT 1');

    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get() as { count: number };
    if (adminCount && adminCount.count === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('admin123', salt);
        db.prepare('INSERT OR IGNORE INTO admin (username, password_hash) VALUES (?, ?)').run('admin', hash);
    }
} catch (e) {
    console.warn('Database initialization warning (possibly during build):', e);
}

export default db;
