# Estrelas do Norte - Gestao de Atletas

Aplicacao React + Vite para cadastro, edicao e listagem de atletas.

## 1. Requisitos

- Node.js 20+
- Conta Firebase (para banco em producao)

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar ambiente

Copie `.env.example` para `.env.local` e preencha as variaveis `VITE_FIREBASE_*` do seu projeto Firebase.

```bash
cp .env.example .env.local
```

Se as variaveis do Firebase estiverem vazias, o sistema continua funcionando em modo local (`localStorage`).

## 4. Criar banco no Firebase Console

1. Acesse Firebase Console > seu projeto.
2. Ative **Firestore Database** em modo producao.
3. Ative **Storage**.
4. Em **Authentication > Sign-in method**, habilite **Anonymous**.
5. Em **Project Settings > General > Your apps (Web)** copie as chaves para `.env.local`.
6. (Opcional, recomendado) Publique as regras de:
   - `firebase/firestore.rules`
   - `firebase/storage.rules`

## 5. Rodar localmente

```bash
npm run dev
```

## 6. Build de producao

```bash
npm run build
```

## Observacoes

- O servico `services/database.ts` usa Firestore/Storage automaticamente quando o Firebase esta configurado.
- Sem Firebase configurado, o app faz fallback automatico para `localStorage`.
