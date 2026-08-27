import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  RefreshCw,
  AlertCircle,
  FileCheck,
  Laptop,
  Send,
  ArrowLeftRight,
  Upload,
  FileText,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import SupabaseConfigModal from './SupabaseConfigModal';
import TeacherHeader from './teacher/TeacherHeader';
import TeacherClassSwaps from './teacher/TeacherClassSwaps';
import { scheduleService } from '../services/scheduleService';
import { certificateService } from '../services/certificateService';
import { labService } from '../services/labService';
import { Schedule, ScheduleStatus } from '../types';

export default function TeacherDashboard() {
  const { user, profile, signOut } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeView, setActiveView] = useState<'classes' | 'swaps' | 'certificate' | 'lab'>('classes');
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estado para envio de atestado
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [certReason, setCertReason] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certSuccess, setCertSuccess] = useState(false);
  const [certSubmitting, setCertSubmitting] = useState(false);

  // Estado para reserva de laboratório
  const [labName, setLabName] = useState('Laboratório de Informática 1');
  const [labDate, setLabDate] = useState(new Date().toISOString().split('T')[0]);
  const [labStart, setLabStart] = useState('08:00');
  const [labEnd, setLabEnd] = useState('09:30');
  const [labSuccess, setLabSuccess] = useState(false);
  const [labSubmitting, setLabSubmitting] = useState(false);

  const fetchTeacherSchedules = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const teacherId = profile?.id || user.id;
      const teacherName = profile?.displayName || '';
      const { data, error } = await scheduleService.fetchTeacherSchedules(teacherId, teacherName);

      if (error) {
        console.error('Error fetching teacher schedules:', error);
        setErrorMsg('Erro ao consultar horários no Supabase: ' + error.message);
      } else {
        setSchedules(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com Supabase';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchTeacherSchedules();
  }, [fetchTeacherSchedules]);

  const updateStatus = async (scheduleId: string, newStatus: ScheduleStatus, subjectName: string) => {
    try {
      const { error } = await scheduleService.updateScheduleStatus(scheduleId, newStatus);
      if (error) {
        alert('Erro ao atualizar presença: ' + error.message);
      } else {
        setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, status: newStatus } : s));
        if (newStatus === 'confirmed') {
          setActionNotice(`✅ Presença confirmada para ${subjectName}! Coordenação notificada.`);
        } else if (newStatus === 'absent') {
          setActionNotice(`⚠️ Ausência informada para ${subjectName}. Sistema buscando substituto.`);
        }
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado';
      alert('Erro inesperado: ' + msg);
    }
  };

  const handleSendCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certReason || !certDate || !user) return;

    setCertSubmitting(true);
    try {
      const { error } = await certificateService.createCertificate({
        teacher_id: user.id,
        teacher_name: profile?.displayName || user.email || 'Professor',
        date: certDate,
        reason: certReason,
        document_name: certFile?.name || null
      });

      if (error) {
        alert('Erro ao enviar atestado: ' + error.message);
      } else {
        setCertSuccess(true);
        setCertReason('');
        setCertFile(null);
        setTimeout(() => setCertSuccess(false), 4000);
      }
    } finally {
      setCertSubmitting(false);
    }
  };

  const handleBookLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName || !labDate || !user) return;

    setLabSubmitting(true);
    try {
      const { error } = await labService.createBooking({
        lab_id: labName,
        teacher_id: user.id,
        teacher_name: profile?.displayName || user.email || 'Professor',
        date: labDate,
        start_time: labStart,
        end_time: labEnd,
      });

      if (error) {
        alert('Erro ao reservar laboratório: ' + error.message);
      } else {
        setLabSuccess(true);
        setTimeout(() => setLabSuccess(false), 4000);
      }
    } finally {
      setLabSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Cálculo de Métricas Inteligentes
  const metrics = useMemo(() => {
    const todayClasses = schedules.filter(s => s.date === todayStr);
    const confirmedCount = schedules.filter(s => s.status === 'confirmed').length;
    const rate = schedules.length > 0 ? Math.round((confirmedCount / schedules.length) * 100) : 100;
    const nextClass = schedules.find(s => s.status !== 'confirmed' && s.status !== 'absent') || schedules[0];
    return {
      todayCount: todayClasses.length,
      confirmedCount,
      rate,
      nextClass
    };
  }, [schedules, todayStr]);

  const displayedSchedules = useMemo(() => {
    if (filterTodayOnly) {
      return schedules.filter(s => s.date === todayStr);
    }
    return schedules;
  }, [schedules, filterTodayOnly, todayStr]);

  const teacherFirstName = (profile?.displayName || user?.email?.split('@')[0] || 'Professor').split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* Teacher Header */}
      <TeacherHeader
        profile={profile}
        loading={loading}
        onRefresh={fetchTeacherSchedules}
        onOpenConfig={() => setIsConfigOpen(true)}
        onSignOut={signOut}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner de Feedback Interativo */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between border border-slate-800"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <Sparkles size={16} className="text-amber-400" />
                <span>{actionNotice}</span>
              </div>
              <button 
                onClick={() => setActionNotice(null)} 
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Aviso de Sincronização:</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* HERO BANNER & STATS CARDS (Inovador, Confiável e com Jogo de Luzes Suave) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80">
          {/* Luzes dinâmicas com transição orgânica suave e aceleração por GPU */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-ambient-1" />
          <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-ambient-2" />
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none animate-aurora" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs">
                  <Zap size={12} className="text-amber-400" /> Portal Docente 2026
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                Olá, {teacherFirstName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Confirme suas presenças com 1 clique para manter a coordenação e a folha de aulas sincronizadas em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={fetchTeacherSchedules}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-blue-300' : ''} />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">Aulas na Grade</span>
                <CalendarIcon size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-black font-display mt-2 text-white">
                {schedules.length} <span className="text-xs font-normal text-slate-400">aulas</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">
                {metrics.todayCount} agendadas para hoje
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">Taxa de Assiduidade</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-display mt-2 text-emerald-400">
                {metrics.rate}%
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> Folha e Diário em dia
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">Próximo Horário</span>
                <Clock size={16} className="text-amber-400" />
              </div>
              <div className="text-sm font-black text-white mt-2 truncate">
                {metrics.nextClass ? `${metrics.nextClass.start_time} • ${metrics.nextClass.subject}` : 'Sem aulas pendentes'}
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-1 truncate">
                {metrics.nextClass ? `${metrics.nextClass.room} (${metrics.nextClass.class_group || 'Geral'})` : 'Grade cumprida'}
              </div>
            </div>
          </div>
        </div>

        {/* Abas Rápidas do Professor com Estilo Moderno */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap sm:flex-nowrap gap-1.5">
          <button
            onClick={() => setActiveView('classes')}
            className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'classes' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Minhas Aulas ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveView('swaps')}
            className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'swaps' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight size={15} />
            <span>Permutas & Trocas</span>
          </button>

          <button
            onClick={() => setActiveView('certificate')}
            className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'certificate' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCheck size={15} />
            <span>Atestado Médico</span>
          </button>

          <button
            onClick={() => setActiveView('lab')}
            className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'lab' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Laptop size={15} />
            <span>Reservar Espaço</span>
          </button>
        </div>

        {/* VISÃO: PERMUTAS DE AULAS */}
        {activeView === 'swaps' && (
          <TeacherClassSwaps
            teacherId={profile?.id || user?.id || 'demo-teacher'}
            teacherName={profile?.displayName || user?.email || 'Prof. Miguel Silva'}
          />
        )}

        {/* VISÃO 1: MINHAS AULAS */}
        {activeView === 'classes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Visualização da Grade:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterTodayOnly(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !filterTodayOnly ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todas ({schedules.length})
                  </button>
                  <button
                    onClick={() => setFilterTodayOnly(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      filterTodayOnly ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Hoje ({metrics.todayCount})
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Toque em <strong className="text-emerald-700">Presente</strong> para confirmar presença ou <strong className="text-rose-700">Ausente</strong> para solicitar cobertura.
              </div>
            </div>

            {displayedSchedules.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200 shadow-xs">
                <CalendarIcon className="mx-auto text-slate-300 mb-4" size={56} />
                <h3 className="text-xl font-bold text-slate-700 font-display">Nenhuma aula encontrada</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  Não há horários cadastrados para o filtro selecionado. Alterne o filtro ou aguarde a coordenação incluir novas aulas.
                </p>
              </div>
            ) : (
              <div className="grid gap-3.5">
                {displayedSchedules.map((schedule) => {
                  const isConfirmed = schedule.status === 'confirmed';
                  const isAbsent = schedule.status === 'absent';
                  const isPending = schedule.status === 'pending' || !schedule.status;
                  const isVaga = schedule.status === 'vaga';

                  return (
                    <motion.div 
                      key={schedule.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative overflow-hidden bg-white rounded-2xl p-5 border transition-all duration-200 ${
                        isConfirmed 
                          ? 'border-emerald-200/90 bg-gradient-to-r from-emerald-50/20 to-white shadow-xs' 
                          : isAbsent 
                          ? 'border-rose-200 bg-rose-50/15 shadow-xs' 
                          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        {/* Time capsule & info */}
                        <div className="flex items-start sm:items-center gap-4 flex-1">
                          {/* Modern Time Capsule */}
                          <div className={`w-20 py-2.5 px-2 rounded-2xl text-center shrink-0 border transition-all ${
                            isConfirmed ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' :
                            isAbsent ? 'bg-rose-500 text-white border-rose-600' :
                            'bg-slate-900 text-white border-slate-800'
                          }`}>
                            <p className="text-lg font-black font-display leading-tight">{schedule.start_time}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">até {schedule.end_time}</p>
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full ${
                                schedule.date === todayStr ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {schedule.date === todayStr ? 'Hoje' : schedule.date}
                              </span>

                              {schedule.class_group && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                                  Turma {schedule.class_group}
                                </span>
                              )}

                              {isConfirmed && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                                  Presença Registrada
                                </span>
                              )}
                              {isAbsent && (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                  Ausência Registrada
                                </span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  Check-in Pendente
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display">
                              {schedule.subject}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-slate-500 font-semibold text-xs">
                              <div className="flex items-center gap-1 text-slate-700">
                                <MapPin size={13} className="text-blue-600" />
                                <span>{schedule.room}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <Clock size={13} />
                                <span>Duração: 50 min</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modern Attendance 1-Click Controls */}
                        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <button 
                            type="button"
                            onClick={() => updateStatus(schedule.id, 'confirmed', schedule.subject)}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                              isConfirmed 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <CheckCircle2 size={15} />
                            <span>{isConfirmed ? 'Confirmado' : 'Estou Presente'}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => updateStatus(schedule.id, 'absent', schedule.subject)}
                            className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                              isAbsent 
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                            }`}
                          >
                            <XCircle size={15} />
                            <span>{isAbsent ? 'Ausente' : 'Falta'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VISÃO 2: ENVIAR ATESTADO MÉDICO */}
        {activeView === 'certificate' && (
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
                  <FileCheck size={24} className="text-blue-600" />
                  <span>Enviar Atestado Médico / Licença</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ao enviar o atestado com foto ou documento, a coordenação é notificada para abonar a ausência e designar um substituto.
                </p>
              </div>
            </div>

            {certSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Atestado enviado com sucesso para a coordenação! Registro salvo no Supabase.</span>
              </div>
            )}

            <form onSubmit={handleSendCertificate} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data do Afastamento / Atestado
                </label>
                <input 
                  type="date"
                  required
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo / Justificativa Médica
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Ex: Consulta médica de urgência / Atestado de 1 dia conforme declaração anexa."
                  value={certReason}
                  onChange={(e) => setCertReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Anexo do Atestado (Foto do Celular ou PDF)
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/30">
                  <Upload size={28} className="text-blue-500 mb-2" />
                  {certFile ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-xl">
                      <FileText size={14} />
                      <span>{certFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800">Clique para anexar foto ou PDF</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Armazenado com criptografia no Supabase Storage</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setCertFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={certSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={15} />
                <span>{certSubmitting ? 'Enviando ao Supabase...' : 'Enviar Atestado para a Coordenação'}</span>
              </button>
            </form>
          </div>
        )}

        {/* VISÃO 3: RESERVAR LABORATÓRIO */}
        {activeView === 'lab' && (
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Laptop size={24} className="text-blue-600" />
                <span>Solicitar Reserva de Espaço Especial</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Reserve laboratórios de informática, robótica ou quadras para suas aulas práticas.
              </p>
            </div>

            {labSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Reserva efetuada com sucesso no Supabase! A coordenação aprovará o espaço.</span>
              </div>
            )}

            <form onSubmit={handleBookLab} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Espaço Desejado
                </label>
                <select
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Laboratório de Informática 1">Laboratório de Informática 1 (35 PCs + Projetor 4K)</option>
                  <option value="Laboratório de Informática 2">Laboratório de Informática 2 (30 PCs)</option>
                  <option value="Laboratório de Ciências & Química">Laboratório de Ciências & Química (Bancadas Completas)</option>
                  <option value="Sala Multimídia / Robótica">Sala Multimídia / Robótica & Maker</option>
                  <option value="Quadra Poliesportiva Coberta">Quadra Poliesportiva Coberta</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={labDate}
                    onChange={(e) => setLabDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Início</label>
                  <input
                    type="time"
                    required
                    value={labStart}
                    onChange={(e) => setLabStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Fim</label>
                  <input
                    type="time"
                    required
                    value={labEnd}
                    onChange={(e) => setLabEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={labSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Laptop size={15} />
                <span>{labSubmitting ? 'Registrando...' : 'Confirmar Reserva do Laboratório'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <SupabaseConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onSaved={fetchTeacherSchedules}
      />
    </div>
  );
}

