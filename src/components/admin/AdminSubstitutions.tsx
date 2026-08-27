import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  MapPin, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowDownToLine,
  UserX,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Schedule, TeacherProfile } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface AdminSubstitutionsProps {
  schedules: Schedule[];
  teachers: TeacherProfile[];
  onRefresh: () => void;
}

// Mapeamento de afinidade de áreas do conhecimento
const SUBJECT_AFFINITY: Record<string, string[]> = {
  'matemática': ['matemática', 'física', 'química', 'ciências', 'estatística'],
  'física': ['física', 'matemática', 'química', 'ciências'],
  'química': ['química', 'biologia', 'ciências', 'física'],
  'biologia': ['biologia', 'ciências', 'química'],
  'ciências': ['ciências', 'biologia', 'química', 'física'],
  'história': ['história', 'geografia', 'sociologia', 'filosofia'],
  'geografia': ['geografia', 'história', 'sociologia', 'atualidades'],
  'português': ['português', 'literatura', 'redação', 'inglês', 'artes'],
  'literatura': ['literatura', 'português', 'redação', 'artes'],
  'redação': ['redação', 'português', 'literatura'],
  'inglês': ['inglês', 'espanhol', 'português', 'linguagens'],
  'educação física': ['educação física', 'recreação', 'esportes'],
  'artes': ['artes', 'música', 'teatro', 'literatura'],
  'filosofia': ['filosofia', 'sociologia', 'história'],
  'sociologia': ['sociologia', 'filosofia', 'história'],
};

export default function AdminSubstitutions({
  schedules,
  teachers,
  onRefresh,
}: AdminSubstitutionsProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShifting, setIsShifting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Aulas ausentes ou vagas que precisam de cobertura
  const needingCoverage = schedules.filter(s => s.status === 'absent' || s.status === 'vaga' || s.status === 'pending');

  // Algoritmo de Inteligência de Substituição (Afinidade de Matéria + Disponibilidade de Horário)
  const teacherSuggestions = useMemo(() => {
    if (!selectedSchedule) return [];

    const scheduleSubject = (selectedSchedule.subject || '').toLowerCase().trim();
    const relatedSubjects = SUBJECT_AFFINITY[scheduleSubject] || [scheduleSubject];

    // Busca professores com suas métricas de choque de horário e afinidade
    return teachers.map(teacher => {
      const teacherSubject = (teacher.subject || '').toLowerCase().trim();
      const isTitular = teacher.id === selectedSchedule.teacher_id;

      // 1. Checagem de choque de horários (se o professor já leciona no mesmo dia e horário)
      const hasConflict = schedules.some(s => 
        s.id !== selectedSchedule.id &&
        s.teacher_id === teacher.id &&
        s.date === selectedSchedule.date &&
        s.status !== 'absent' &&
        s.status !== 'vaga' &&
        // Verifica sobreposição de horário
        ((s.start_time <= selectedSchedule.start_time && s.end_time > selectedSchedule.start_time) ||
         (s.start_time < selectedSchedule.end_time && s.end_time >= selectedSchedule.end_time) ||
         (s.start_time >= selectedSchedule.start_time && s.end_time <= selectedSchedule.end_time))
      );

      // 2. Pontuação de afinidade
      let affinityScore = 40; // Base para qualquer professor disponível
      let matchType: 'exact' | 'related' | 'available' = 'available';

      if (teacherSubject && scheduleSubject.includes(teacherSubject) || teacherSubject.includes(scheduleSubject)) {
        affinityScore = 100;
        matchType = 'exact';
      } else if (teacherSubject && relatedSubjects.some(sub => teacherSubject.includes(sub) || sub.includes(teacherSubject))) {
        affinityScore = 75;
        matchType = 'related';
      }

      if (hasConflict) {
        affinityScore -= 60; // Penalidade alta por choque de horário
      }

      return {
        teacher,
        hasConflict,
        affinityScore,
        matchType,
        isTitular
      };
    })
    .filter(item => !item.isTitular) // Não sugerir o próprio professor ausente
    .sort((a, b) => b.affinityScore - a.affinityScore);
  }, [selectedSchedule, teachers, schedules]);

  // Aulas da mesma turma no dia (para visualização do fluxo de horários)
  const sameDayGroupSchedules = useMemo(() => {
    if (!selectedSchedule) return [];
    return schedules
      .filter(s => s.date === selectedSchedule.date && (selectedSchedule.class_group ? s.class_group === selectedSchedule.class_group : s.room === selectedSchedule.room))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [selectedSchedule, schedules]);

  const isAlreadyLastClass = useMemo(() => {
    if (sameDayGroupSchedules.length <= 1 || !selectedSchedule) return false;
    return sameDayGroupSchedules[sameDayGroupSchedules.length - 1].id === selectedSchedule.id;
  }, [sameDayGroupSchedules, selectedSchedule]);

  const handleSubstitute = async (e?: React.FormEvent, directTeacherId?: string) => {
    if (e) e.preventDefault();
    const teacherIdToUse = directTeacherId || selectedTeacherId;
    if (!selectedSchedule || !teacherIdToUse) return;

    const teacher = teachers.find(t => t.id === teacherIdToUse);
    if (!teacher) return;

    setIsSubmitting(true);
    try {
      const { error } = await scheduleService.substituteTeacher(
        selectedSchedule.id,
        teacher.id,
        teacher.display_name || teacher.email
      );

      if (error) {
        alert('Erro ao realizar substituição: ' + error.message);
      } else {
        setSuccessMsg(`Substituição concluída com sucesso! Prof. ${teacher.display_name || teacher.email} assumiu a aula de ${selectedSchedule.subject}.`);
        setSelectedSchedule(null);
        setSelectedTeacherId('');
        onRefresh();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reorganizar grade para empurrar aula vaga para o final do dia
  const handleShiftToDayEnd = async () => {
    if (!selectedSchedule) return;

    setIsShifting(true);
    try {
      const res = await scheduleService.shiftVacantToDayEnd(selectedSchedule.id);
      if (res.error) {
        alert('Erro ao reorganizar horários: ' + res.error.message);
      } else {
        setSuccessMsg(res.message);
        setSelectedSchedule(null);
        setSelectedTeacherId('');
        onRefresh();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } finally {
      setIsShifting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            Central de Substituições com IA
            <Sparkles size={20} className="text-amber-500" />
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Algoritmo inteligente: cruza especialidades, disponibilidade de horários sem choques e reorganiza a grade para evitar janelas.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shrink-0">
          <Zap size={14} className="text-blue-600" />
          <span>{needingCoverage.length} aulas aguardando atenção</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-xs animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Coluna 1: Lista de Aulas Precisando de Cobertura (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Aulas Ausentes ou Vagas ({needingCoverage.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Clique para solucionar</span>
          </div>

          {needingCoverage.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <h5 className="text-base font-bold text-slate-800">Grade 100% Coberta!</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Não há nenhuma aula vaga ou ausência pendente de substituição no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {needingCoverage.map((schedule) => {
                const isSelected = selectedSchedule?.id === schedule.id;
                return (
                  <div 
                    key={schedule.id}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setSelectedTeacherId('');
                    }}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer space-y-2 ${
                      isSelected 
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20 bg-blue-50/20' 
                        : 'border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          schedule.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                          schedule.status === 'vaga' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {schedule.status === 'absent' ? 'Falta / Ausente' : 
                           schedule.status === 'vaga' ? 'Aula Vaga' : 'Pendente'}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{schedule.date}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                        {schedule.start_time} - {schedule.end_time}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-display">{schedule.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Docente: <strong className="text-slate-700">{schedule.teacher_name}</strong> • Sala: {schedule.room} {schedule.class_group ? `(${schedule.class_group})` : ''}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchedule(schedule);
                          setSelectedTeacherId('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white'
                        }`}
                      >
                        Solucionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna 2: Painel de Resolução Inteligente (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Ações e Sugestões da IA
          </h4>

          {selectedSchedule ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
              {/* Header da Aula Selecionada */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100/60 px-2 py-0.5 rounded-md">
                      Aula Selecionada
                    </span>
                    <span className="text-xs font-bold text-slate-600">{selectedSchedule.date}</span>
                    <span className="text-xs text-slate-400 font-mono">({selectedSchedule.start_time} - {selectedSchedule.end_time})</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">
                    {selectedSchedule.subject} {selectedSchedule.class_group ? `• ${selectedSchedule.class_group}` : ''}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Docente ausente: <strong className="text-slate-700">{selectedSchedule.teacher_name}</strong> | Sala {selectedSchedule.room}
                  </p>
                </div>
              </div>

              {/* OPÇÃO 1: Mover Aula Vaga para o Final do Dia */}
              <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ArrowDownToLine size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-indigo-950 font-display flex items-center gap-2">
                        Reorganização Inteligente: Mover Vaga para o Fim do Dia
                      </h5>
                      <p className="text-xs text-indigo-800/80 mt-0.5">
                        Puxa as próximas aulas da turma para cima, eliminando "janelas" (tempo ocioso no meio da manhã/tarde) e liberando os alunos mais cedo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <span className="font-bold text-slate-700">Turma: {selectedSchedule.class_group || `Sala ${selectedSchedule.room}`}</span>
                    <p className="text-[11px] text-slate-500">
                      {isAlreadyLastClass 
                        ? '✅ Esta aula já está posicionada no final do período da turma.' 
                        : `A turma tem ${sameDayGroupSchedules.length} aulas hoje. As aulas seguintes serão antecipadas em 1 horário.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isShifting || isAlreadyLastClass}
                    onClick={handleShiftToDayEnd}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownToLine size={15} />
                    <span>{isShifting ? 'Reorganizando Grade...' : isAlreadyLastClass ? 'Já no Fim do Dia' : 'Empurrar Vaga p/ Fim do Dia'}</span>
                  </button>
                </div>
              </div>

              {/* OPÇÃO 2: Sugestões da IA por Especialidade & Disponibilidade */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Sugestões da IA (Match de Matéria & Sem Choque de Horário)
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400">Ordenado por compatibilidade</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {teacherSuggestions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Nenhum outro professor cadastrado no corpo docente.
                    </div>
                  ) : (
                    teacherSuggestions.map(({ teacher, hasConflict, affinityScore, matchType }) => (
                      <div 
                        key={teacher.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          hasConflict 
                            ? 'bg-slate-50/60 border-slate-200 opacity-60' 
                            : matchType === 'exact'
                            ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                            : matchType === 'related'
                            ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {teacher.display_name || teacher.email}
                            </span>
                            {teacher.subject && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <GraduationCap size={12} />
                                {teacher.subject}
                              </span>
                            )}
                            {matchType === 'exact' && (
                              <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                Match Perfeito (Mesma Matéria)
                              </span>
                            )}
                            {matchType === 'related' && (
                              <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Mesma Área de Ensino
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            {hasConflict ? (
                              <span className="text-rose-600 font-bold flex items-center gap-1">
                                <AlertTriangle size={12} /> Choque de horário (Lecionando nesta faixa)
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Horário 100% Livre (Sem Choque)
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting || hasConflict}
                          onClick={() => handleSubstitute(undefined, teacher.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                            hasConflict
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : matchType === 'exact'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          }`}
                        >
                          <Check size={14} />
                          <span>Designar Substituto</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* OPÇÃO 3: Seleção Manual de Qualquer Docente */}
              <form onSubmit={(e) => handleSubstitute(e)} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ou Escolha Manualmente na Lista Geral
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Selecione o professor...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.display_name || t.email} {t.subject ? `(${t.subject})` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTeacherId}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck size={16} />
                    <span>{isSubmitting ? 'Salvando...' : 'Atribuir'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Clock size={40} className="mx-auto text-slate-300" />
              <h5 className="text-sm font-bold text-slate-700">Nenhuma aula selecionada</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione qualquer aula vaga ou com ausência na coluna à esquerda para ver os professores recomendados pela IA ou mover a vaga para o final do dia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

