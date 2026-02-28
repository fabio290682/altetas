import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { database } from '../services/database';
import { AppConfig } from '../types';

const SidebarLink: React.FC<{ to: string; icon: string; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active ? 'bg-[#c5a059] text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium uppercase text-xs tracking-widest">{label}</span>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig>(database.getAppConfig());

  const isAuthenticated = database.isAuthenticated();
  const currentUser = database.getCurrentUser();
  const isAdmin = currentUser.role === 'ADMIN';

  useEffect(() => {
    const handleUpdate = () => {
      setAppConfig(database.getAppConfig());
    };
    window.addEventListener('appConfigUpdated', handleUpdate);
    return () => window.removeEventListener('appConfigUpdated', handleUpdate);
  }, []);

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  const appNameParts = appConfig.appName.split(' ');
  const mainName = appNameParts[0] || 'Estrelas';
  const subName = appNameParts.slice(1).join(' ') || 'do Norte';

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-[#0a1d37] p-6 fixed h-full z-20 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-[#c5a059] shadow-inner overflow-hidden">
            {appConfig.logoURL ? (
              <img src={appConfig.logoURL} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-4xl">*</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">{mainName}</h1>
            <p className="text-[10px] text-[#c5a059] font-bold tracking-[0.2em] uppercase -mt-1">{subName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/" icon="D" label="Dashboard" active={location.pathname === '/'} />
          <SidebarLink to="/cadastro" icon="C" label="Cadastro" active={location.pathname === '/cadastro'} />
          <SidebarLink to="/atletas" icon="A" label="Atletas" active={location.pathname === '/atletas'} />
          {isAdmin && <SidebarLink to="/configuracoes" icon="S" label="Ajustes" active={location.pathname === '/configuracoes'} />}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center text-[#0a1d37] text-xs font-black">
              {currentUser.nome?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-white truncate uppercase">{currentUser.nome}</p>
              <p className="text-[9px] text-[#c5a059] font-bold truncate">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => database.logout()}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <span>X</span>
            <span>SAIR</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative">
        <header className="md:hidden bg-[#0a1d37] p-4 flex justify-between items-center sticky top-0 z-30 shadow-lg border-b border-[#c5a059]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#c5a059] flex items-center justify-center bg-white/10 overflow-hidden">
              {appConfig.logoURL ? (
                <img src={appConfig.logoURL} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-sm text-white">*</span>
              )}
            </div>
            <h1 className="text-xs font-black text-white uppercase tracking-tighter">{appConfig.appName}</h1>
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-white text-2xl">
            {isSidebarOpen ? 'X' : '='}
          </button>
        </header>

        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            <div className="absolute top-0 left-0 w-64 h-full bg-[#0a1d37] p-6 shadow-2xl">
              <nav className="space-y-4">
                <SidebarLink to="/" icon="D" label="Dashboard" active={location.pathname === '/'} />
                <SidebarLink to="/cadastro" icon="C" label="Cadastro" active={location.pathname === '/cadastro'} />
                <SidebarLink to="/atletas" icon="A" label="Atletas" active={location.pathname === '/atletas'} />
                {isAdmin && <SidebarLink to="/configuracoes" icon="S" label="Ajustes" active={location.pathname === '/configuracoes'} />}
              </nav>
              <button
                onClick={() => database.logout()}
                className="mt-8 flex items-center gap-3 px-4 py-3 w-full text-red-400 border border-red-400/20 rounded-lg transition-all text-[10px] font-black uppercase"
              >
                <span>X</span> SAIR DA CONTA
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {children}
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Desenvolvido por 3Brasil</p>
        </div>
      </main>
    </div>
  );
};

export default Layout;
