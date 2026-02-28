
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastroAtleta from './pages/CadastroAtleta';
import ListagemAtletas from './pages/ListagemAtletas';
import EditarAtleta from './pages/EditarAtleta';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import { database } from './services/database';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!database.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/cadastro" element={<ProtectedRoute><Layout><CadastroAtleta /></Layout></ProtectedRoute>} />
        <Route path="/atletas" element={<ProtectedRoute><Layout><ListagemAtletas /></Layout></ProtectedRoute>} />
        <Route path="/editar/:id" element={<ProtectedRoute><Layout><EditarAtleta /></Layout></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><Layout><Configuracoes /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
