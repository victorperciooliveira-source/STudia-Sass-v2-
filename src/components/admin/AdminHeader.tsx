import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminHeaderProps {
  profile: UserProfile | null;
  loadingData: boolean;
  onRefresh: () => void;
  onOpenConfig: () => void;
}

export default function AdminHeader({
  profile,
  loadingData,
  onRefresh,
  onOpenConfig,
}: AdminHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-mono text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema Escolar Sincronizado
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onRefresh}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
          title="Atualizar dados"
        >
          <RefreshCw size={18} className={loadingData ? 'animate-spin' : ''} />
        </button>
        <button 
          onClick={onOpenConfig}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
        >
          <Database size={16} />
          Configurações de Rede
        </button>
        <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{profile?.displayName || 'Diretor'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-emerald-800">
            {profile?.displayName?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
