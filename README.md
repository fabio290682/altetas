# Estrelas do Norte - Gestao de Atletas

Aplicacao React + API Node com banco SQLite.

## Rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Inicie frontend + API SQLite:

```bash
npm run dev
```

3. Acesse:

- Frontend: `http://127.0.0.1:3000/#/login`
- API health: `http://127.0.0.1:4000/api/health`

Login demo:

- usuario: `admin`
- senha: `estrelas2026`

## Banco SQLite

- Arquivo local: `data/app.db`
- Em producao (Render): caminho configurado por `SQLITE_DB_PATH`

## Build

```bash
npm run build
```

## Deploy com SQLite persistente (Render)

O arquivo `render.yaml` ja esta pronto.

1. Suba este projeto para um repositorio GitHub.
2. Abra no navegador:

```text
https://dashboard.render.com/blueprint/new?repo=SEU_REPO_GITHUB
```

3. Clique em `Apply`.

Render vai criar:

- 1 Web Service Node
- 1 disco persistente de 1GB para o SQLite

Depois do deploy, os cadastros ficam salvos no SQLite persistente.
