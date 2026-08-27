import React from 'react';
import { motion } from 'motion/react';
import { BarChart, PlusCircle } from 'lucide-react';
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
import { ScheduleStats } from '../../types';

interface AdminStatsCardsProps {
  stats: ScheduleStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const dailyRate = stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : '0';
  const progressRatio = stats.total > 0 ? stats.confirmed / stats.total : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Aulas Totais" value={stats.total} />
      <StatCard label="Confirmadas" value={stats.confirmed} subValue="Presença OK" subColor="text-emerald-500" />
      <StatCard label="Presença Diária" value={`${dailyRate}%`} isProgress progress={progressRatio} />
      <StatCard label="Pendências" value={stats.pending} subValue="Aguardando confirmação" subColor="text-amber-500" />
    </div>
  );
}

export function AdminReportsView({ stats }: { stats: ScheduleStats }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Relatórios de Frequência</h3>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Total: {stats.total} aulas
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart size={20} className="text-emerald-600" />
            Distribuição de Presença
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PlusCircle size={20} className="text-emerald-600" />
            Visão Percentual
          </h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
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
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subValue, 
  subColor, 
  isProgress, 
  progress 
}: { 
  label: string; 
  value: string | number; 
  subValue?: string; 
  subColor?: string; 
  isProgress?: boolean; 
  progress?: number; 
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-extrabold mt-1 text-slate-900">{value}</h3>
      {subValue && <p className={`text-xs font-bold mt-2 ${subColor}`}>{subValue}</p>}
      {isProgress && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(progress || 0) * 100}%` }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      )}
    </div>
  );
}
