import React from 'react';
import { Clock, MapPin, CheckCircle, XCircle, Users } from 'lucide-react';
import { Schedule, ScheduleStatus } from '../../types';

interface TeacherScheduleCardProps {
  schedule: Schedule;
  onUpdateStatus: (id: string, status: ScheduleStatus) => Promise<void>;
}

export default function TeacherScheduleCard({
  schedule,
  onUpdateStatus,
}: TeacherScheduleCardProps) {
  const isConfirmed = schedule.status === 'confirmed';
  const isAbsent = schedule.status === 'absent';
  const isVaga = schedule.status === 'vaga';

  return (
    <div className={`p-6 rounded-3xl border transition-all shadow-xs ${
      isConfirmed ? 'bg-white border-emerald-200 ring-2 ring-emerald-500/10' :
      isAbsent ? 'bg-white border-rose-200' :
      isVaga ? 'bg-indigo-50/50 border-indigo-200' :
      'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-slate-900">{schedule.subject}</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isConfirmed ? 'bg-emerald-100 text-emerald-700' :
              isAbsent ? 'bg-rose-100 text-rose-700' :
              isVaga ? 'bg-indigo-100 text-indigo-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {isConfirmed ? 'Presença Confirmada' :
               isAbsent ? 'Falta / Ausência' :
               isVaga ? 'Aula Vaga (Substituição)' :
               'Aguardando Confirmação'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold text-slate-800">
              <Clock size={14} className="text-blue-600" />
              {schedule.start_time} - {schedule.end_time}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700">
              <MapPin size={14} className="text-slate-500" />
              {schedule.room}
            </span>
            {schedule.class_group && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl font-semibold">
                <Users size={14} className="text-blue-600" />
                Turma {schedule.class_group}
              </span>
            )}
            <span className="text-slate-400 font-mono text-[11px]">
              Data: {schedule.date}
            </span>
          </div>
        </div>

        {/* Action Buttons for Attendance */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onUpdateStatus(schedule.id, 'confirmed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isConfirmed 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
            }`}
            title="Confirmar presença nesta aula"
          >
            <CheckCircle size={15} />
            <span>{isConfirmed ? 'Confirmado' : 'Estou Presente'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateStatus(schedule.id, 'absent')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAbsent 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
            }`}
            title="Informar ausência nesta aula"
          >
            <XCircle size={15} />
            <span>{isAbsent ? 'Ausente' : 'Ausência'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
