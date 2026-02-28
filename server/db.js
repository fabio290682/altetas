import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const configuredPath = process.env.SQLITE_DB_PATH;
const fallbackPath = path.resolve(process.cwd(), 'data', 'app.db');
const dbPath = configuredPath ? path.resolve(configuredPath) : fallbackPath;
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS atletas (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export function getDb() {
  return db;
}

export function closeDb() {
  db.close();
}
