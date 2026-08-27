import React from 'react';
import { Database, RefreshCw, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import StudiaLogo from '../StudiaLogo';
import { UserProfile } from '../../types';

interface TeacherHeaderProps {
  profile: UserProfile | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenConfig: () => void;
  onSignOut: () => void;
}

export default function TeacherHeader({
  profile,
  loading,
  onRefresh,
  onOpenConfig,
  onSignOut,
}: TeacherHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-all">
      <div className="flex items-center gap-3">
        <StudiaLogo width={135} height={38} />
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Portal Conectado
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            Colégio Estadual Modelo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <button 
          onClick={onRefresh}
          className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          title="Sincronizar dados agora"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
        </button>

        <button 
          onClick={onOpenConfig}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-xs cursor-pointer active:scale-95"
        >
          <Database size={14} className="text-slate-500" />
          <span>Configurações de Rede</span>
        </button>

        {/* Teacher Profile Card */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/90 px-3 py-1.5 rounded-2xl shadow-xs">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl border border-white shadow-xs flex items-center justify-center font-black text-white text-xs">
              {profile?.displayName?.charAt(0) || 'P'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-slate-900">
                {profile?.displayName || 'Prof. Miguel Silva'}
              </p>
              <ShieldCheck size={12} className="text-blue-600" />
            </div>
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
              {profile?.subject ? `Docente de ${profile.subject}` : 'Docente Titular'}
            </p>
          </div>
        </div>

        <button 
          onClick={onSignOut}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          title="Encerrar sessão"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

