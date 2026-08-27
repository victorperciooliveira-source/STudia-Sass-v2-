import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  UserCheck, 
  RefreshCw, 
  Play, 
  Pause, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  MapPin,
  Bot
} from 'lucide-react';

export default function LiveDashboard() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Cenários do ciclo inteligente do Studia
  const steps = [
    {
      id: 'schedule_ok',
      tag: 'Cenário 1: Grade Normal',
      title: 'Grade do Dia Carregada',
      badge: '98% Presença Regular',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      description: 'Grade sincronizada em tempo real com todas as turmas e professores alocados sem conflito.',
    },
    {
      id: 'absence_alert',
      tag: 'Cenário 2: Evento Imprevisto',
      title: 'Ausência Notificada pelo Professor',
      badge: 'Alerta Crítico: Aula Vaga Iminente',
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      description: 'Prof. Marcos (Física - 3º EM) registrou atestado médico às 07:15. A aula das 08:20 ficaria vaga.',
    },
    {
      id: 'smart_match',
      tag: 'Cenário 3: Algoritmo de Substituição',
      title: 'Inteligência Studia Match',
      badge: 'Substituta Compatível Encontrada',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      description: 'Sistema detecta que a Profª Mariana (Química/Ciências) está com janela livre no mesmo bloco.',
    },
    {
      id: 'resolved',
      tag: 'Cenário 4: Presença Salva',
      title: 'Substituição Concluída com 1 Toque',
      badge: '100% Cobertura Garantida',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      description: 'Profª Mariana confirmou o aceite. Alunos e direção notificados instantaneamente sem aula vaga.',
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="relative w-full max-w-5xl mx-auto perspective-container">
      {/* Luzes Volumétricas de Fundo com Movimento Orgânico Suave */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-ambient-1"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none animate-ambient-2"></div>

      {/* Frame Principal 3D do Live Dashboard */}
      <div className="relative bg-slate-900/90 text-white rounded-3xl p-4 sm:p-6 md:p-8 border border-white/15 shadow-2xl backdrop-blur-2xl card-3d-tilt overflow-hidden">
        {/* Barra Superior Estilo macOS / App de Elite */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-smooth-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                Studia Engine • Live Simulation
              </span>
            </div>
          </div>

          {/* Controles do Vídeo/Simulador */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-full p-1 text-xs">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentStep === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Passo {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title={isPlaying ? 'Pausar simulação' : 'Iniciar simulação contínua'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>

        {/* Banner do Passo Atual */}
        <div className="pt-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                    {steps[currentStep].tag}
                  </span>
                  <span className="text-white/20">•</span>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {steps[currentStep].title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold shrink-0 self-start md:self-auto ${steps[currentStep].badgeColor}`}>
                {steps[currentStep].badge}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Grade Interativa de Horários Encendo a Solução */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Cartão 1: Aula Normal */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden transition-all hover:bg-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-slate-400 font-bold">07:30 - 08:20</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 size={11} /> Confirmada
              </span>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Matemática Aplicada</h5>
              <p className="text-xs text-slate-300 font-medium">Prof. Carlos Alberto</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-2 font-mono">
                <span className="flex items-center gap-1"><MapPin size={10} /> Sala 101</span>
                <span>Turma 3º A (EM)</span>
              </div>
            </div>
          </div>

          {/* Cartão 2: AULA FOCO (Onde o imprevisto acontece e o Studia resolve) */}
          <div className={`rounded-2xl p-4 relative overflow-hidden transition-all border ${
            currentStep === 0 
              ? 'bg-white/5 border-white/10' 
              : currentStep === 1 
              ? 'bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/20' 
              : currentStep === 2
              ? 'bg-blue-500/15 border-blue-400/50 ring-2 ring-blue-500/30'
              : 'bg-emerald-500/15 border-emerald-400/40 ring-2 ring-emerald-500/20'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-slate-400 font-bold">08:20 - 09:10</span>
              
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.span 
                    key="step0"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1"
                  >
                    <Clock size={11} /> Agendada
                  </motion.span>
                )}

                {currentStep === 1 && (
                  <motion.span 
                    key="step1"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1 shadow-lg shadow-rose-900/50 animate-pulse"
                  >
                    <AlertTriangle size={11} /> Falta Informada
                  </motion.span>
                )}

                {currentStep === 2 && (
                  <motion.span 
                    key="step2"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500 text-white flex items-center gap-1 shadow-lg shadow-blue-900/50"
                  >
                    <Bot size={11} /> IA Sugere Substituta
                  </motion.span>
                )}

                {currentStep === 3 && (
                  <motion.span 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-lg shadow-emerald-900/50"
                  >
                    <UserCheck size={11} /> Substituição OK
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">Física Moderna & Óptica</h5>
              
              <div className="min-h-[38px] flex items-center">
                {currentStep <= 1 && (
                  <p className={`text-xs font-medium transition-colors ${currentStep === 1 ? 'text-rose-300 line-through' : 'text-slate-300'}`}>
                    Prof. Marcos Oliveira (Ausente)
                  </p>
                )}

                {currentStep === 2 && (
                  <div className="w-full bg-blue-950/80 border border-blue-400/40 rounded-xl p-2 flex items-center justify-between">
                    <div className="text-[11px] text-blue-200">
                      <p className="font-bold">Profª Mariana Santos</p>
                      <p className="text-[9px] text-blue-300/80">Janela Livre • Compatível</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-900/60 px-2 py-1 rounded">
                      1 Toque
                    </span>
                  </div>
                )}

                {currentStep === 3 && (
                  <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Profª Mariana (Substituta em Sala)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-2 font-mono border-t border-white/5">
                <span className="flex items-center gap-1"><MapPin size={10} /> Lab de Ciências</span>
                <span>Turma 3º A (EM)</span>
              </div>
            </div>
          </div>

          {/* Cartão 3: Aula Seguinte */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden transition-all hover:bg-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-slate-400 font-bold">09:30 - 10:20</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Clock size={11} /> Em Aguardo
              </span>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-white text-sm">História do Brasil</h5>
              <p className="text-xs text-slate-300 font-medium">Profª Renata Mendes</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-2 font-mono">
                <span className="flex items-center gap-1"><MapPin size={10} /> Sala 204</span>
                <span>Turma 2º B (EM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Informativo do Dashboard com Métricas */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sparkles size={14} className="text-blue-400" />
              Tempo médio de resolução: <strong className="text-white">42 segundos</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">Sincronização: Tempo Real (Nuvem)</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={12} /> Proteção Escolar Ativa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
