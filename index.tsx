
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { database } from './services/database';

try {
  // Inicializa as estruturas de dados no localStorage para a demo funcionar offline
  database.init();
} catch (e) {
  console.error("Erro ao inicializar banco de dados local:", e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento root no DOM.");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
