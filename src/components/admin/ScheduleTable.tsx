import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { Schedule } from '../../types';

interface ScheduleTableProps {
  schedules: Schedule[];
  onOpenNewModal: () => void;
  onDeleteSchedule: (id: string) => void;
}

export default function ScheduleTable({
  schedules,
  onOpenNewModal,
  onDeleteSchedule,
}: ScheduleTableProps) {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-16 text-center">
        <Calendar className="mx-auto text-slate-200 mb-4" size={56} />
        <h4 className="text-lg font-bold text-slate-700">Nenhum horário cadastrado na grade</h4>
        <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 mb-6">
          O sistema escolar está pronto. Clique no botão abaixo para adicionar a primeira aula na grade.
        </p>
        <button 
          onClick={onOpenNewModal}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
        >
          + Cadastrar Primeiro Horário
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Matéria</th>
              <th className="px-8 py-5">Horário & Data</th>
              <th className="px-8 py-5">Professor</th>
              <th className="px-8 py-5">Local / Turma</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {schedules.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5 font-bold text-slate-800">{s.subject}</td>
                <td className="px-8 py-5">
                  <div className="text-sm font-semibold">{s.start_time} - {s.end_time}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{s.date}</div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-600">{s.teacher_name}</td>
                <td className="px-8 py-5 text-sm font-medium text-slate-600">
                  {s.room} {s.class_group ? `(${s.class_group})` : ''}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    s.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'absent' ? 'bg-rose-100 text-rose-700' : 
                    s.status === 'vaga' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {s.status === 'confirmed' ? 'Confirmado' : 
                     s.status === 'absent' ? 'Ausente' : 
                     s.status === 'vaga' ? 'Aula Vaga' : 'Pendente'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onDeleteSchedule(s.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
