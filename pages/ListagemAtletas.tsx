
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atleta } from '../types';
import { database } from '../services/database';
import { exportAtletasCSV } from '../utils/exportCSV';
import { generateAtletaPDF } from '../utils/generateAtletaPDF';
import { useRole } from '../hooks/useRole';

const ListagemAtletas: React.FC = () => {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [filtered, setFiltered] = useState<Atleta[]>([]);
  const [search, setSearch] = useState('');
  const [filterPosicao, setFilterPosicao] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { isAdmin, isTecnico } = useRole();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await database.getAtletas();
    setAtletas(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    let result = atletas.filter(a => 
      (a.nome && a.nome.toLowerCase().includes(search.toLowerCase())) || 
      (a.cpf && a.cpf.includes(search))
    );
    if (filterPosicao) {
      result = result.filter(a => a.posicao === filterPosicao);
    }
    setFiltered(result);
  }, [search, filterPosicao, atletas]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente remover este atleta? Esta ação é irreversível.')) {
      await database.deleteAtleta(id);
      loadData();
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    exportAtletasCSV(filtered);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a1d37] tracking-tight uppercase">Atletas Cadastrados</h1>
          <p className="text-gray-500 font-medium">Base de dados Estrelas do Norte.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2 bg-[#c5a059] text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[#c5a059]/20"
          >
            <span>📥</span> EXPORTAR CSV
          </button>
          
          <div className="flex gap-2 flex-1 md:flex-initial">
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="flex-1 md:w-64 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#c5a059]/10 focus:border-[#c5a059] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a1d37] border-b border-[#c5a059]">
                <th className="px-6 py-5 text-[10px] font-black text-[#c5a059] uppercase tracking-widest">Identificação</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#c5a059] uppercase tracking-widest">Documentação</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#c5a059] uppercase tracking-widest text-center">Posição</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#c5a059] uppercase tracking-widest">Idade</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#c5a059] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#c5a059] border-t-transparent"></div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((atleta) => (
                  <tr key={atleta.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {atleta.photoURL ? (
                          <img src={atleta.photoURL} className="w-12 h-12 rounded-full object-cover border-2 border-[#c5a059] shadow-sm" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#0a1d37] font-black text-lg border-2 border-[#c5a059]/20 shadow-sm">
                            {(atleta.nome || '?').charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 leading-tight uppercase text-sm">{atleta.nome || 'Sem Nome'}</p>
                          <p className="text-[10px] text-[#c5a059] font-bold tracking-widest mt-0.5">{atleta.whatsapp || 'CONTATO NÃO INFORMADO'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-700">{atleta.cpf || '-'}</div>
                      <div className="text-[10px] text-gray-400 font-bold">NIS: {atleta.nis || '-'}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#0a1d37]/5 text-[#0a1d37] border border-[#0a1d37]/10 uppercase">
                        {atleta.posicao || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-600">
                         {atleta.dataNascimento ? `${Math.floor((new Date().getTime() - new Date(atleta.dataNascimento).getTime()) / 31557600000)} ANOS` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => generateAtletaPDF(atleta)}
                          title="Ficha em PDF" 
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-[10px] font-bold uppercase"
                        >
                          <span>📄</span> PDF
                        </button>
                        
                        {isTecnico && (
                          <button 
                            onClick={() => navigate(`/editar/${atleta.id}`)}
                            title="Editar Dados" 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </button>
                        )}
                        
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(atleta.id!)} 
                            title="Remover Registro" 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListagemAtletas;
