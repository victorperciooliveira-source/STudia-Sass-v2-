import React, { useRef } from 'react';
import { 
  BarChart, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  School,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { ScheduleStats, Schedule } from '../../types';
import StudiaLogo from '../StudiaLogo';

interface AdminReportsAndPrintProps {
  stats: ScheduleStats;
  schedules: Schedule[];
}

export default function AdminReportsAndPrint({ stats, schedules }: AdminReportsAndPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            Relatórios Executivos & Grade Oficial A4
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gere a versão oficial da grade para o quadro de avisos da escola ou arquivamento pedagógico.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer size={16} />
          <span>Imprimir Grade A4 Paisagem</span>
        </button>
      </div>

      {/* Gráficos de Frequência */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <h4 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2 font-display">
            <BarChart size={18} className="text-blue-600" />
            Distribuição Geral de Frequência Docente
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Taxa de Eficiência e Presença Escolar
          </h4>
          
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Taxa de Aulas Cobertas:</span>
            <strong className="text-emerald-600 text-sm font-bold">{stats.presenceRate}%</strong>
          </div>
        </div>
      </div>

      {/* Visualizador de Grade Oficial para Impressão */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
            Prévia do Documento Oficial A4
          </h4>
          <span className="text-[10px] font-bold text-slate-400">Pronto para afixação e auditoria</span>
        </div>

        <div className="border border-slate-300 rounded-2xl p-8 bg-white" ref={printRef}>
          {/* Header do Documento Oficial */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <StudiaLogo width={140} height={40} />
              <div className="border-l-2 border-slate-300 pl-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Grade Horária Geral de Aulas</h2>
                <p className="text-[10px] text-slate-500 font-semibold">Sistema de Gestão Escolar Studia • Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-800">Total de Horários: {schedules.length}</p>
              <p className="text-[10px] text-emerald-600 font-bold">Cobertura: {stats.presenceRate}%</p>
            </div>
          </div>

          {/* Tabela Formatada A4 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Horário</th>
                  <th className="py-2.5 px-4">Disciplina</th>
                  <th className="py-2.5 px-4">Professor</th>
                  <th className="py-2.5 px-4">Sala / Turma</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedules.map((s) => (
                  <tr key={s.id} className="text-slate-800">
                    <td className="py-2.5 px-4 font-medium">{s.date}</td>
                    <td className="py-2.5 px-4 font-mono font-bold">{s.start_time} - {s.end_time}</td>
                    <td className="py-2.5 px-4 font-bold">{s.subject}</td>
                    <td className="py-2.5 px-4">{s.teacher_name}</td>
                    <td className="py-2.5 px-4">{s.room} {s.class_group ? `(${s.class_group})` : ''}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        s.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'absent' ? 'bg-rose-100 text-rose-800' :
                        s.status === 'vaga' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status === 'confirmed' ? 'Confirmado' :
                         s.status === 'absent' ? 'Ausente' :
                         s.status === 'vaga' ? 'Aula Vaga' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
            <span>Studia Gestão Escolar • Grade Digital e Gestão Pedagógica</span>
            <span>Visto da Coordenação: ___________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
