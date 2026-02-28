
import React, { useState, useEffect } from 'react';
import { database, mockStorage } from '../services/database';
import { AppConfig } from '../types';

const Configuracoes: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(database.getAppConfig());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string>(config.logoURL);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await mockStorage.uploadFile(file);
      setPreview(base64);
      setConfig(prev => ({ ...prev, logoURL: base64 }));
    }
  };

  const handleSave = () => {
    setSaving(true);
    database.updateAppConfig(config);
    setTimeout(() => {
      setSaving(false);
      alert('Configurações salvas com sucesso!');
      window.location.reload(); // Recarrega para aplicar a logo em todo o layout
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0a1d37] uppercase tracking-tight">Identidade Visual</h1>
          <p className="text-gray-500 font-medium">Personalize a logomarca e o nome do seu projeto.</p>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-2 border-[#c5a059] shadow-inner overflow-hidden mb-4">
              {preview ? (
                <img src={preview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-4xl">⭐</span>
              )}
            </div>
            
            <label className="cursor-pointer">
              <span className="px-6 py-2 bg-[#0a1d37] text-[#c5a059] rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-125 transition-all shadow-lg shadow-[#0a1d37]/20">
                Selecionar Logomarca
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
            <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest text-center">
              Recomendado: PNG ou JPG fundo transparente<br/>Mínimo 200x200px
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Projeto / App</label>
            <input 
              type="text" 
              value={config.appName}
              onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
              placeholder="Ex: Estrelas do Norte"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all font-bold text-[#0a1d37]"
            />
          </div>

          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-[#c5a059] text-white rounded-xl font-black shadow-lg shadow-[#c5a059]/20 hover:brightness-110 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? 'Aplicando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
