import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db.js';

const app = express();
const db = getDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const DEFAULT_CONFIG = { logoURL: '', appName: 'Estrelas do Norte' };

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function upsertAtleta(payload) {
  const now = new Date().toISOString();
  const id = payload.id || Math.random().toString(36).slice(2, 11);
  const createdAt = payload.createdAt || now;
  const prepared = { ...payload, id, createdAt };

  db.prepare(
    `INSERT INTO atletas (id, data, created_at, updated_at)
     VALUES (@id, @data, @created_at, @updated_at)
     ON CONFLICT(id) DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at`
  ).run({
    id,
    data: JSON.stringify(prepared),
    created_at: createdAt,
    updated_at: now
  });

  return prepared;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: 'sqlite' });
});

app.get('/api/atletas', (_req, res) => {
  const rows = db
    .prepare('SELECT data FROM atletas ORDER BY created_at DESC')
    .all();

  const atletas = rows.map((row) => JSON.parse(row.data));
  res.json(atletas);
});

app.get('/api/atletas/:id', (req, res) => {
  const row = db.prepare('SELECT data FROM atletas WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ message: 'Atleta nao encontrado' });
    return;
  }

  res.json(JSON.parse(row.data));
});

app.post('/api/atletas', (req, res) => {
  const payload = req.body;
  const atleta = upsertAtleta(payload);
  res.status(201).json(atleta);
});

app.put('/api/atletas/:id', (req, res) => {
  const existing = db.prepare('SELECT data FROM atletas WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ message: 'Atleta nao encontrado' });
    return;
  }

  const current = JSON.parse(existing.data);
  const merged = { ...current, ...req.body, id: req.params.id };
  const atleta = upsertAtleta(merged);
  res.json(atleta);
});

app.delete('/api/atletas/:id', (req, res) => {
  const result = db.prepare('DELETE FROM atletas WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ message: 'Atleta nao encontrado' });
    return;
  }

  res.status(204).send();
});

app.get('/api/config', (_req, res) => {
  const row = db.prepare('SELECT value FROM app_config WHERE key = ?').get('app');
  if (!row) {
    res.json(DEFAULT_CONFIG);
    return;
  }

  res.json(JSON.parse(row.value));
});

app.put('/api/config', (req, res) => {
  const currentRow = db.prepare('SELECT value FROM app_config WHERE key = ?').get('app');
  const current = currentRow ? JSON.parse(currentRow.value) : DEFAULT_CONFIG;
  const updated = { ...current, ...req.body };

  db.prepare(
    `INSERT INTO app_config (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run('app', JSON.stringify(updated));

  res.json(updated);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`SQLite API running on http://127.0.0.1:${port}`);
});
