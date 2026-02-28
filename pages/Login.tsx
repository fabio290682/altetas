import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../services/database';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const config = database.getAppConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const user = await database.login(email, password);
        if (!user) {
          setError('Credenciais invalidas. Tente novamente.');
          setLoading(false);
          return;
        }
      } else {
        await database.registerUser({
          nome,
          email,
          password,
          role: 'VISUALIZADOR'
        });
      }

      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha de autenticacao.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1d37] p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c5a059]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c5a059]/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full animate-fade-in relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-[#0a1d37] p-10 text-center relative border-b-4 border-[#c5a059]">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg border-2 border-[#c5a059] mb-4 overflow-hidden">
              {config.logoURL ? (
                <img src={config.logoURL} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-4xl">*</span>
              )}
            </div>
            <h1 className="text-white text-2xl font-black uppercase tracking-tighter">{config.appName}</h1>
            <p className="text-[#c5a059] text-[10px] font-bold uppercase tracking-[0.3em]">Portal Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-4 py-2 rounded-lg ${mode === 'login' ? 'bg-[#0a1d37] text-[#c5a059]' : 'bg-gray-100 text-gray-500'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-4 py-2 rounded-lg ${mode === 'register' ? 'bg-[#0a1d37] text-[#c5a059]' : 'bg-gray-100 text-gray-500'}`}
              >
                Criar Usuario
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-black uppercase text-center border border-red-100">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all font-bold text-[#0a1d37]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email / Usuario</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all font-bold text-[#0a1d37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all font-bold text-[#0a1d37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#0a1d37] text-[#c5a059] rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-125 shadow-xl shadow-[#0a1d37]/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Acessar Sistema' : 'Criar Conta'}
            </button>

            {mode === 'login' && (
              <div className="pt-2 text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  Usuario inicial: admin / estrelas2026
                </p>
              </div>
            )}
          </form>
        </div>

        <p className="text-center mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          {config.appName} (c) {new Date().getFullYear()} - Gestao Esportiva
        </p>
      </div>
    </div>
  );
};

export default Login;
