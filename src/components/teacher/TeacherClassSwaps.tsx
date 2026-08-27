import React, { useState, useEffect } from 'react';
import { ClassSwapRequest, TeacherProfile } from '../../types';
import { tenantService } from '../../services/tenantService';
import { profileService } from '../../services/profileService';
import { ArrowLeftRight, Check, X, Clock, UserCheck, Send, AlertCircle, Sparkles } from 'lucide-react';

interface TeacherClassSwapsProps {
  teacherId: string;
  teacherName: string;
}

export default function TeacherClassSwaps({ teacherId, teacherName }: TeacherClassSwapsProps) {
  const [swaps, setSwaps] = useState<ClassSwapRequest[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [targetTeacher, setTargetTeacher] = useState('');
  const [myClassInfo, setMyClassInfo] = useState('');
  const [targetClassInfo, setTargetClassInfo] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);

  const loadSwaps = () => {
    setSwaps(tenantService.getSwapRequests());
  };

  useEffect(() => {
    loadSwaps();
    profileService.fetchTeachers().then(res => {
      if (res.data && res.data.length > 0) {
        const others = res.data.filter(t => t.id !== teacherId);
        setTeachers(others.length > 0 ? others : res.data);
        if (others.length > 0 && !targetTeacher) {
          setTargetTeacher(others[0].display_name);
        }
      }
    });
  }, [teacherId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myClassInfo || !reason || !targetTeacher) return;

    tenantService.createSwapRequest({
      school_id: 'school-colegio-modelo',
      requester_id: teacherId,
      requester_name: teacherName || 'Docente Responsável',
      target_teacher_id: 'target-teacher-id',
      target_teacher_name: targetTeacher,
      requester_schedule_id: 'sch-' + Date.now(),
      requester_schedule_info: myClassInfo,
      target_schedule_id: 'target-sch-' + Date.now(),
      target_schedule_info: targetClassInfo,
      reason,
    });

    setReason('');
    setSuccess(true);
    loadSwaps();
    setTimeout(() => setSuccess(false), 3500);
  };

  const handleUpdateStatus = (swapId: string, status: 'accepted' | 'rejected') => {
    tenantService.updateSwapStatus(swapId, status);
    loadSwaps();
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <ArrowLeftRight size={22} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display">Troca Direta de Aulas (Permuta Docente)</h3>
          <p className="text-xs text-slate-600 mt-1">
            Precisa faltar ou ajustar seus horários? Solicite uma troca diretamente para outro professor. Quando ele aceitar, a grade e a coordenação são atualizadas automaticamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Solicitação */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Send size={15} className="text-emerald-600" />
            <span>Propor Nova Permuta</span>
          </h4>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Minha Aula que Quero Trocar</label>
              <input
                type="text"
                value={myClassInfo}
                onChange={(e) => setMyClassInfo(e.target.value)}
                placeholder="Ex: Matemática (3º Ano A) - 07:30 às 08:20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Professor(a) Desejado(a)</label>
              {teachers.length > 0 ? (
                <select
                  value={targetTeacher}
                  onChange={(e) => setTargetTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="">Selecione o professor...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.display_name}>
                      {t.display_name} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={targetTeacher}
                  onChange={(e) => setTargetTeacher(e.target.value)}
                  placeholder="Nome do colega docente"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Aula Desejada do Colega (Opcional)</label>
              <input
                type="text"
                value={targetClassInfo}
                onChange={(e) => setTargetClassInfo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Motivo da Solicitação</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Consulta médica agendada / Imprevisto pessoal"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
              />
            </div>

            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check size={16} className="text-emerald-600" />
                Permuta enviada! O professor receberá o chamado no chat e no portal.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Enviar Proposta de Troca</span>
            </button>
          </form>
        </div>

        {/* Lista de Permutas */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-emerald-600" />
              <span>Solicitações de Permuta Ativas</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{swaps.length} registros</span>
          </div>

          <div className="space-y-3">
            {swaps.map((swap) => (
              <div key={swap.id} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{swap.requester_name}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="font-bold text-slate-900 text-xs">{swap.target_teacher_name}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    swap.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                    swap.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {swap.status === 'accepted' ? 'Aceita & Aprovada' :
                     swap.status === 'rejected' ? 'Recusada' : 'Aguardando Resposta'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 space-y-1 font-medium">
                  <div><strong>Aula cedida:</strong> {swap.requester_schedule_info}</div>
                  {swap.target_schedule_info && <div><strong>Aula solicitada:</strong> {swap.target_schedule_info}</div>}
                  <div className="text-[11px] text-slate-500 pt-1"><strong>Motivo:</strong> {swap.reason}</div>
                </div>

                {swap.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(swap.id, 'rejected')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X size={12} /> Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(swap.id, 'accepted')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                    >
                      <Check size={12} /> Aceitar Permuta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
