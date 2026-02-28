import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
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

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');
  if (!salt || !originalHash) return false;

  const hashBuffer = Buffer.from(originalHash, 'hex');
  const testBuffer = scryptSync(password, salt, 64);

  if (hashBuffer.length !== testBuffer.length) return false;
  return timingSafeEqual(hashBuffer, testBuffer);
}

function ensureDefaultAdmin() {
  const row = db.prepare('SELECT COUNT(*) as total FROM users').get();
  if ((row?.total || 0) > 0) return;

  const now = new Date().toISOString();
  const defaultUser = {
    id: `usr_${randomBytes(6).toString('hex')}`,
    nome: process.env.ADMIN_DEFAULT_NAME || 'Administrador',
    email: process.env.ADMIN_DEFAULT_EMAIL || 'admin',
    role: 'ADMIN',
    password_hash: hashPassword(process.env.ADMIN_DEFAULT_PASSWORD || 'estrelas2026'),
    created_at: now,
    updated_at: now
  };

  db.prepare(
    `INSERT INTO users (id, nome, email, role, password_hash, created_at, updated_at)
     VALUES (@id, @nome, @email, @role, @password_hash, @created_at, @updated_at)`
  ).run(defaultUser);
}

ensureDefaultAdmin();

export function getDb() {
  return db;
}

export function closeDb() {
  db.close();
}
