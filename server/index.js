import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { getDb, hashPassword, verifyPassword } from './db.js';

const app = express();
const db = getDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const DEFAULT_CONFIG = { logoURL: '', appName: 'Estrelas do Norte' };
const SESSION_DAYS = 7;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function nowIso() {
  return new Date().toISOString();
}

function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO sessions (token, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?)`
  ).run(token, userId, createdAt, expiresAt);

  return token;
}

function cleanExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(nowIso());
}

function userResponse(userRow) {
  return {
    uid: userRow.id,
    nome: userRow.nome,
    email: userRow.email,
    role: userRow.role
  };
}

function getAuthToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

function requireAuth(req, res, next) {
  cleanExpiredSessions();
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ message: 'Nao autenticado' });
    return;
  }

  const session = db
    .prepare(
      `SELECT s.token, s.user_id, s.expires_at, u.id, u.nome, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token);

  if (!session || session.expires_at < nowIso()) {
    res.status(401).json({ message: 'Sessao invalida' });
    return;
  }

  req.auth = {
    token,
    user: {
      id: session.id,
      nome: session.nome,
      email: session.email,
      role: session.role
    }
  };

  next();
}

function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acesso restrito a administradores' });
    return;
  }
  next();
}

function upsertAtleta(payload) {
  const now = nowIso();
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

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    res.status(400).json({ message: 'Informe usuario e senha' });
    return;
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .get(String(identifier).trim());

  if (!user || !verifyPassword(String(password), user.password_hash)) {
    res.status(401).json({ message: 'Credenciais invalidas' });
    return;
  }

  const token = createSession(user.id);
  res.json({ token, user: userResponse(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { nome, email, password, role } = req.body || {};
  if (!nome || !email || !password) {
    res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' });
    return;
  }

  const userCount = db.prepare('SELECT COUNT(*) as total FROM users').get();
  const creatingFirstUser = (userCount?.total || 0) === 0;

  if (!creatingFirstUser) {
    requireAuth(req, res, () => {
      requireAdmin(req, res, () => {
        const exists = db.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').get(String(email).trim());
        if (exists) {
          res.status(409).json({ message: 'Email ja cadastrado' });
          return;
        }

        const now = nowIso();
        const userId = `usr_${randomBytes(6).toString('hex')}`;
        db.prepare(
          `INSERT INTO users (id, nome, email, role, password_hash, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          userId,
          String(nome).trim(),
          String(email).trim(),
          role || 'VISUALIZADOR',
          hashPassword(String(password)),
          now,
          now
        );

        const created = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        res.status(201).json({ user: userResponse(created) });
      });
    });
    return;
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').get(String(email).trim());
  if (exists) {
    res.status(409).json({ message: 'Email ja cadastrado' });
    return;
  }

  const now = nowIso();
  const userId = `usr_${randomBytes(6).toString('hex')}`;
  db.prepare(
    `INSERT INTO users (id, nome, email, role, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    String(nome).trim(),
    String(email).trim(),
    'ADMIN',
    hashPassword(String(password)),
    now,
    now
  );

  const created = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const token = createSession(userId);
  res.status(201).json({ token, user: userResponse(created) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: userResponse(req.auth.user) });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.auth.token);
  res.status(204).send();
});

app.get('/api/atletas', requireAuth, (_req, res) => {
  const rows = db
    .prepare('SELECT data FROM atletas ORDER BY created_at DESC')
    .all();

  const atletas = rows.map((row) => JSON.parse(row.data));
  res.json(atletas);
});

app.get('/api/atletas/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT data FROM atletas WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ message: 'Atleta nao encontrado' });
    return;
  }

  res.json(JSON.parse(row.data));
});

app.post('/api/atletas', requireAuth, (req, res) => {
  const payload = req.body;
  const atleta = upsertAtleta(payload);
  res.status(201).json(atleta);
});

app.put('/api/atletas/:id', requireAuth, (req, res) => {
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

app.delete('/api/atletas/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM atletas WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ message: 'Atleta nao encontrado' });
    return;
  }

  res.status(204).send();
});

app.get('/api/config', requireAuth, (_req, res) => {
  const row = db.prepare('SELECT value FROM app_config WHERE key = ?').get('app');
  if (!row) {
    res.json(DEFAULT_CONFIG);
    return;
  }

  res.json(JSON.parse(row.value));
});

app.put('/api/config', requireAuth, (req, res) => {
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

export default app;

const isServerless = !!process.env.VERCEL;
if (!isServerless) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`SQLite API running on http://127.0.0.1:${port}`);
  });
}
