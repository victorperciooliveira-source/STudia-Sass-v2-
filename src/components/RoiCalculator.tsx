import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, Clock, DollarSign, Sparkles, School, Check, ShieldCheck } from 'lucide-react';

interface RoiCalculatorProps {
  initialClasses?: number;
}

export default function RoiCalculator({ initialClasses = 18 }: RoiCalculatorProps) {
  const [classesCount, setClassesCount] = useState<number>(initialClasses);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [pulseKey, setPulseKey] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const min = 4;
  const max = 60;
  const percentage = Math.min(100, Math.max(0, ((classesCount - min) / (max - min)) * 100));

  // Calculations
  const hoursSavedPerWeek = Math.round(classesCount * 1.6);
  const hoursSavedPerMonth = hoursSavedPerWeek * 4;
  const moneySavedPerMonth = Math.round(classesCount * 280);
  const annualSavings = moneySavedPerMonth * 12;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setClassesCount(val);
    setPulseKey(prev => prev + 1);
  };

  const presets = [
    { label: 'Pequena', count: 8, subtitle: '1 turno' },
    { label: 'Média', count: 18, subtitle: '2 turnos' },
    { label: 'Grande', count: 35, subtitle: 'Integral' },
    { label: 'Rede / Polo', count: 55, subtitle: 'Multicampus' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Dynamic Vercel Ambient Spotlight that tracks the slider handle - Suavizado e mais fraco */}
      <div 
        className="absolute -top-32 pointer-events-none transition-all duration-500 ease-out -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30"
        style={{
          left: `${percentage}%`,
          background: `radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)`,
        }}
      />

      {/* Main Glassmorphism Container with Laser Glow Border */}
      <div className="relative z-10 bg-slate-950/85 border border-slate-800/80 hover:border-blue-500/40 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-2xl transition-colors duration-500 overflow-hidden group">
        {/* Subtle grid pattern background like Vercel */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top dynamic light beam across container border */}
        <div 
          className="absolute top-0 h-[2px] transition-all duration-300 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
          style={{
            left: `${percentage}%`,
            width: isInteracting ? '240px' : '140px',
            opacity: isInteracting ? 0.8 : 0.4,
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
          }}
        />

        {/* Header Badge & Titles */}
        <div className="text-center space-y-3 mb-10 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/90 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest shadow-inner shadow-blue-500/10">
            <Sparkles size={13} className="text-cyan-400 animate-pulse" />
            <span>Simulador de Eficiência Escolar</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
            Descubra quanto sua escola economiza por mês
          </h2>
          
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            Arraste a barra interativa abaixo para dimensionar o ganho de tempo da coordenação e a redução de custos com aulas vagas.
          </p>
        </div>

        {/* Presets Rápidos */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {presets.map((p) => {
            const isSelected = classesCount === p.count;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setClassesCount(p.count);
                  setPulseKey(prev => prev + 1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{p.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {p.count} turmas
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Slider Area */}
        <div className="space-y-6 max-w-2xl mx-auto relative pt-2 pb-2">
          {/* Header of the Slider with Dynamic Count Display */}
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-2 text-slate-300">
              <School size={16} className="text-blue-400" />
              <span>Número de Turmas:</span>
            </div>

            <motion.div 
              key={classesCount}
              initial={{ scale: 1.1, color: '#38bdf8' }}
              animate={{ scale: 1, color: '#60a5fa' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-3xl font-black font-display text-white tracking-tight">
                {classesCount}
              </span>
              <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                turmas
              </span>
            </motion.div>
          </div>

          {/* Vercel Glowing Slider Stage with Perfectly Centered Thumb */}
          <div 
            ref={trackRef}
            className="relative select-none pt-8 pb-1"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
          >
            {/* Tooltip Acima da Bolinha */}
            <div 
              className={`absolute top-0 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center ${
                isInteracting ? 'transition-none' : 'transition-[left] duration-200 ease-out'
              }`}
              style={{ left: `${percentage}%` }}
            >
              <div className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-tight text-white border flex items-center gap-1 shadow-lg backdrop-blur-md transition-all ${
                isInteracting 
                  ? 'bg-blue-600 border-cyan-400 scale-105 shadow-blue-500/30' 
                  : 'bg-slate-900/95 border-blue-500/30 scale-100 shadow-black/50'
              }`}>
                <span>{classesCount} turmas</span>
              </div>
              <div className={`w-1.5 h-1.5 rotate-45 -mt-1 border-r border-b ${
                isInteracting ? 'bg-blue-600 border-cyan-400' : 'bg-slate-900 border-blue-500/30'
              }`} />
            </div>

            {/* Dedicated Centered Slider Track Wrapper */}
            <div className="relative h-7 flex items-center">
              {/* Background Track with Notch Markers */}
              <div className="relative w-full h-3 bg-slate-900/95 rounded-full border border-slate-800/90 overflow-hidden shadow-inner">
                {/* Luminous Active Progress Track */}
                <div 
                  className={`absolute top-0 bottom-0 left-0 rounded-full ${
                    isInteracting ? 'transition-none' : 'transition-[width] duration-200 ease-out'
                  }`}
                  style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 60%, #38bdf8 100%)',
                    boxShadow: isInteracting 
                      ? '0 0 10px rgba(56, 189, 248, 0.35)' 
                      : '0 0 6px rgba(56, 189, 248, 0.2)',
                  }}
                >
                  {/* Subtle shimmer line */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite] -translate-x-full" />
                </div>

                {/* Ticks at 0%, 25%, 50%, 75%, 100% */}
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none items-center">
                  <span className={`w-1 h-1 rounded-full ${percentage >= 0 ? 'bg-cyan-200/80' : 'bg-slate-700'}`} />
                  <span className={`w-1 h-1 rounded-full ${percentage >= 25 ? 'bg-cyan-200/80' : 'bg-slate-700'}`} />
                  <span className={`w-1 h-1 rounded-full ${percentage >= 50 ? 'bg-cyan-200/80' : 'bg-slate-700'}`} />
                  <span className={`w-1 h-1 rounded-full ${percentage >= 75 ? 'bg-cyan-200/80' : 'bg-slate-700'}`} />
                  <span className={`w-1 h-1 rounded-full ${percentage >= 100 ? 'bg-cyan-200/80' : 'bg-slate-700'}`} />
                </div>
              </div>

              {/* The Actual Range Input (Invisible overlay for pure tactile precision) */}
              <input 
                id="school-classes-range"
                aria-label="Selecionar número de turmas da escola"
                type="range" 
                min={min} 
                max={max} 
                value={classesCount} 
                onMouseDown={() => setIsInteracting(true)}
                onMouseUp={() => setIsInteracting(false)}
                onTouchStart={() => setIsInteracting(true)}
                onTouchEnd={() => setIsInteracting(false)}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />

              {/* Visual Custom Centered Thumb ("Bolinha" com brilho suave e alinhamento 100% exato) */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center ${
                  isInteracting ? 'transition-none' : 'transition-[left] duration-200 ease-out'
                }`}
                style={{ left: `${percentage}%` }}
              >
                {/* Outer Pulse Wave on Value Change - Mais suave */}
                <AnimatePresence>
                  {pulseKey > 0 && (
                    <motion.div
                      key={pulseKey}
                      initial={{ scale: 0.8, opacity: 0.35 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute w-6 h-6 rounded-full bg-cyan-400/40 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Concentric Modern Thumb Ring - Brilho suave e refinado */}
                <div 
                  className={`w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform duration-150 ${
                    isInteracting 
                      ? 'scale-110 shadow-[0_0_10px_rgba(56,189,248,0.4),0_2px_5px_rgba(0,0,0,0.4)]' 
                      : 'scale-100 shadow-[0_0_6px_rgba(56,189,248,0.25),0_1px_4px_rgba(0,0,0,0.35)]'
                  }`}
                >
                  {/* Thumb Inner Core */}
                  <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Min & Max Labels - Posicionados fora do fluxo do track */}
            <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-2 px-1">
              <span>{min} turmas (Mínimo)</span>
              <span className="text-slate-400">Escola Padrão (~20 turmas)</span>
              <span>{max} turmas (Rede)</span>
            </div>
          </div>

          {/* VERCEL-STYLE REACTIVE METRIC CARDS */}
          <div className="grid sm:grid-cols-2 gap-5 pt-4">
            {/* Card 1: Tempo Salvo */}
            <motion.div 
              animate={{
                scale: isInteracting ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-emerald-400/40 rounded-2xl p-6 sm:p-7 text-center space-y-3 backdrop-blur-xl group/card transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden"
            >
              {/* Top ambient glow inside card */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-20 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover/card:bg-emerald-500/30 transition-all" />

              <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-emerald-400 tracking-wider">
                <Clock size={15} />
                <span>Tempo Salvo da Coordenação</span>
              </div>

              <div className="flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={hoursSavedPerWeek}
                    initial={{ y: 8, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -8, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl sm:text-5xl font-black text-emerald-400 font-display tracking-tight drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  >
                    ~{hoursSavedPerWeek}h <span className="text-xl sm:text-2xl text-emerald-300/80 font-bold">/ sem</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-1">
                <p className="text-xs text-slate-300 font-medium">
                  Equivalente a <strong className="text-white">~{hoursSavedPerMonth} horas úteis</strong> poupadas todos os meses.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Menos estresse com ligações de emergência e remanejamentos manuais.
                </p>
              </div>

              {/* Micro Progress Bar on Card */}
              <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-emerald-950 mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>

            {/* Card 2: Produtividade & Economia Financeira */}
            <motion.div 
              animate={{
                scale: isInteracting ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-cyan-400/40 rounded-2xl p-6 sm:p-7 text-center space-y-3 backdrop-blur-xl group/card transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden"
            >
              {/* Top ambient glow inside card */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-20 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none group-hover/card:bg-cyan-500/30 transition-all" />

              <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-cyan-400 tracking-wider">
                <TrendingUp size={15} />
                <span>Produtividade & Economia</span>
              </div>

              <div className="flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={moneySavedPerMonth}
                    initial={{ y: 8, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -8, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl sm:text-5xl font-black text-cyan-400 font-display tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  >
                    R$ {moneySavedPerMonth.toLocaleString('pt-BR')}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-1">
                <p className="text-xs text-slate-300 font-medium">
                  Até <strong className="text-white">R$ {annualSavings.toLocaleString('pt-BR')}/ano</strong> em valor operacional recuperado.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Elimina o custo oculto de horas ociosas e desorganização de horários.
                </p>
              </div>

              {/* Micro Progress Bar on Card */}
              <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-cyan-950 mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Trust Stamp */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Check size={14} className="text-cyan-400" />
              Retorno sobre o investimento comprovado no 1º mês
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Check size={14} className="text-emerald-400" />
              Implementação assistida para sua equipe pedagógica
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
