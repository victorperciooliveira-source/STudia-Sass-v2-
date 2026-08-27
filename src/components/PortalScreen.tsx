import React from 'react';
import { motion } from 'motion/react';
import StudiaLogo from './StudiaLogo';
import { 
  ArrowLeft, 
  Database, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Layers,
  Smartphone,
  Zap
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import Reveal from './Reveal';

interface PortalScreenProps {
  onBackToSaas: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSupabaseConfig: () => void;
}

export default function PortalScreen({ onBackToSaas, onOpenAuth, onOpenSupabaseConfig }: PortalScreenProps) {
  const { isConfigured, loginAsDemo } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white bg-aurora-mesh relative overflow-hidden">
      {/* Luzes dinâmicas de fundo suaves e fluidas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-400/15 via-cyan-300/15 to-indigo-400/10 blur-[130px] pointer-events-none rounded-full animate-ambient-1"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-cyan-300/10 blur-[100px] pointer-events-none rounded-full animate-ambient-2"></div>

      {/* Top Status Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-between relative z-50">
        <button 
          onClick={onBackToSaas}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Voltar ao site Studia SaaS</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
            <span className={`inline-block w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            {isConfigured ? 'Servidor Escolar Ativo' : 'Servidor pronto'}
          </span>
          <button 
            onClick={onOpenSupabaseConfig}
            className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Database size={11} />
            Configurações de Rede
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between border-b border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="cursor-pointer" onClick={onBackToSaas}>
          <StudiaLogo width={180} height={52} />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenAuth('login')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Entrar no Sistema
          </button>
        </div>
      </header>

      {/* Center Hero com Escolha de Portais */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto w-full">
        <Reveal direction="up" delay={0.1}>
          <div className="space-y-4 max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shadow-xs">
              <Sparkles size={13} className="text-blue-600" />
              <span>Portal Unificado de Acesso Institucional</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] font-display">
              A gestão escolar,<br />
              <span className="text-gradient-studia">redefinida.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
              Selecione o seu perfil para acessar a grade de horários, presenças e reservas da sua escola.
            </p>
          </div>
        </Reveal>

        {/* Cards de Acesso Rápido */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
          {/* Card 1: Direção & Coordenação */}
          <Reveal direction="up" delay={0.2}>
            <div 
              onClick={() => onOpenAuth('login')}
              className="bg-white border-2 border-slate-200/80 hover:border-blue-500 rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center mb-5 shadow-xs">
                <Building2 size={28} />
              </div>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
                Coordenação & Direção
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-3 font-display">
                Painel da Diretoria
              </h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Gestão completa de grade, substituição de faltas em 1 clique, aprovação de atestados, reservas de laboratórios e relatórios oficiais A4.
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Entrar como Gestor</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAsDemo('admin');
                  }}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-blue-200"
                >
                  <Zap size={12} className="text-amber-500 fill-amber-400" />
                  <span>Testar Direção Agora (1 Clique)</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Docente / Professor */}
          <Reveal direction="up" delay={0.3}>
            <div 
              onClick={() => onOpenAuth('login')}
              className="bg-white border-2 border-slate-200/80 hover:border-emerald-500 rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center mb-5 shadow-xs">
                  <GraduationCap size={28} />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                  Corpo Docente
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 font-display">
                  Portal do Professor
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  Check-in de presença rápido pelo celular, consulta de aulas diárias por turno, solicitação de salas/laboratórios e envio de atestados.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Entrar como Professor</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAsDemo('teacher');
                  }}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
                >
                  <Zap size={12} className="text-amber-500 fill-amber-400" />
                  <span>Testar Professor Agora (1 Clique)</span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Botão de Registro */}
        <Reveal direction="up" delay={0.4}>
          <div className="mt-10 flex items-center gap-2 text-xs text-slate-500">
            <span>Sua escola ainda não possui conta?</span>
            <button 
              onClick={() => onOpenAuth('register')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Cadastrar Nova Escola / Professor
            </button>
          </div>
        </Reveal>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 bg-white/40">
        <p>Studia • Sistema de Gestão Escolar & Grade Digital Integrada</p>
      </footer>
    </div>
  );
}
