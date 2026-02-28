
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Atleta } from '../types';
import { database } from '../services/database';

const EditarAtleta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Atleta>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      database.getAtletaById(id).then(data => {
        if (data) setForm(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    await database.updateAtleta(id, form);
    setSaving(false);
    alert('Atleta atualizado com sucesso!');
    navigate('/atletas');
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#c5a059] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-black text-[#0a1d37] uppercase tracking-tight mb-2">Editar Atleta</h1>
        <p className="text-gray-500 mb-8 font-medium">Atualize as informações principais do registro.</p>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input
              value={form.nome || ''}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Posição</label>
              <select
                value={form.posicao || ''}
                onChange={e => setForm({ ...form, posicao: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all bg-white"
              >
                <option value="">Selecione...</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Lateral">Lateral</option>
                <option value="Meio-campo">Meio-campo</option>
                <option value="Atacante">Atacante</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
              <input
                value={form.whatsapp || ''}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Peso (kg)</label>
              <input
                value={form.peso || ''}
                onChange={e => setForm({ ...form, peso: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Altura (m)</label>
              <input
                value={form.altura || ''}
                onChange={e => setForm({ ...form, altura: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Camisa</label>
              <input
                value={form.tamanhoCamisa || ''}
                onChange={e => setForm({ ...form, tamanhoCamisa: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Calçado</label>
              <input
                value={form.numCalcado || ''}
                onChange={e => setForm({ ...form, numCalcado: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#c5a059] outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              onClick={() => navigate('/atletas')}
              className="flex-1 py-3 px-6 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all uppercase text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-6 bg-[#0a1d37] text-[#c5a059] rounded-xl font-black shadow-lg shadow-[#0a1d37]/20 hover:brightness-125 transition-all uppercase text-xs tracking-widest"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarAtleta;
