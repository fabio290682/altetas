
import React, { useEffect, useState } from 'react';
import { Atleta } from '../types';
import { database } from '../services/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.getAtletas().then(data => {
      setAtletas(data);
      setLoading(false);
    });
  }, []);

  const getStats = () => {
    const total = atletas.length;
    const masc = atletas.filter(a => a.sexo === 'Masculino').length;
    const fem = atletas.filter(a => a.sexo === 'Feminino').length;
    
    const positions = atletas.reduce((acc: any, a) => {
      const pos = a.posicao || 'Não Inf.';
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(positions).map(key => ({
      name: key,
      value: positions[key]
    }));

    const foot = atletas.reduce((acc: any, a) => {
       const f = a.peDominante || 'Não Inf.';
       acc[f] = (acc[f] || 0) + 1;
       return acc;
    }, {});

    const footData = Object.keys(foot).map(key => ({
       name: key,
       value: foot[key]
    }));

    const genderData = [
      { name: 'Masculino', value: masc },
      { name: 'Feminino', value: fem }
    ];

    return { total, masc, fem, chartData, genderData, footData };
  };

  const stats = getStats();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
       <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c5a059] border-t-transparent"></div>
       <p className="text-[#0a1d37] font-black uppercase tracking-widest text-xs">Acessando Banco de Dados...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a1d37] p-8 rounded-3xl border-b-4 border-[#c5a059] shadow-2xl text-white">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Estrelas do Norte</h1>
          <p className="text-[#c5a059] font-bold tracking-[0.2em] text-xs uppercase mt-1">Gestão Institucional e Esportiva</p>
        </div>
        <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md">
          <span className="text-xs font-black uppercase tracking-widest text-green-400">Banco de Dados Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="TOTAL DE ATLETAS" value={stats.total} icon="🏆" />
        <StatCard title="ELENCO MASCULINO" value={stats.masc} icon="⚽" />
        <StatCard title="ELENCO FEMININO" value={stats.fem} icon="🎗️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-sm font-black text-[#0a1d37] mb-8 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> Distribuição por Posição
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={100} tick={{fontWeight: 'bold', fill: '#0a1d37'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="#0a1d37" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-sm font-black text-[#0a1d37] mb-8 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> Perfil de Dominância
          </h3>
          <div className="h-72 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.footData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.footData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0a1d37' : '#c5a059'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: number, icon: string }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between group hover:shadow-2xl transition-all border-b-4 border-b-[#c5a059]">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-4xl font-black text-[#0a1d37] mt-1 tracking-tighter">{value}</h4>
    </div>
    <div className="text-4xl bg-[#c5a059]/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all">{icon}</div>
  </div>
);

export default Dashboard;
