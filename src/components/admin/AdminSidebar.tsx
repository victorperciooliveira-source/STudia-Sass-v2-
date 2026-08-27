import React from 'react';
import { 
  Calendar, 
  BarChart, 
  Database, 
  LogOut, 
  Zap, 
  Laptop, 
  FileCheck, 
  Printer,
  School,
  MessageSquare
} from 'lucide-react';
import StudiaLogo from '../StudiaLogo';

export type AdminTab = 'schedules' | 'substitutions' | 'whatsapp' | 'labs' | 'certificates' | 'reports' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onOpenConfig: () => void;
  onSignOut: () => void;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onOpenConfig,
  onSignOut,
}: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-5 text-slate-400 shrink-0 select-none">
      <div className="p-2 flex items-center gap-3 border-b border-slate-800 pb-5">
        <StudiaLogo width={150} height={42} variant="dark" />
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 pt-6 pb-2">
        Gestão Pedagógica
      </div>

      <nav className="space-y-1.5">
        <SidebarLink 
          icon={<Calendar size={18} />} 
          label="Grade Geral" 
          isActive={activeTab === 'schedules'} 
          onClick={() => onTabChange('schedules')} 
        />
        <SidebarLink 
          icon={<Zap size={18} />} 
          label="Substituições" 
          isActive={activeTab === 'substitutions'} 
          onClick={() => onTabChange('substitutions')} 
          badge="Smart"
        />
        <SidebarLink 
          icon={<Laptop size={18} />} 
          label="Laboratórios" 
          isActive={activeTab === 'labs'} 
          onClick={() => onTabChange('labs')} 
        />
        <SidebarLink 
          icon={<FileCheck size={18} />} 
          label="Atestados & Licenças" 
          isActive={activeTab === 'certificates'} 
          onClick={() => onTabChange('certificates')} 
        />
        <SidebarLink 
          icon={<BarChart size={18} />} 
          label="Relatórios & A4" 
          isActive={activeTab === 'reports'} 
          onClick={() => onTabChange('reports')} 
        />
      </nav>

      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 pt-6 pb-2">
        SaaS & Comunicação
      </div>

      <nav className="space-y-1.5 flex-1">
        <SidebarLink 
          icon={<MessageSquare size={18} />} 
          label="Chat & Alertas" 
          isActive={activeTab === 'whatsapp'} 
          onClick={() => onTabChange('whatsapp')} 
          badge="Chat"
        />
        <SidebarLink 
          icon={<School size={18} />} 
          label="Escola & Multi-Unidades" 
          isActive={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')} 
          badge="PRO"
        />
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4 space-y-1.5">
        <button 
          onClick={onOpenConfig}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          <Database size={16} className="text-blue-400" />
          <span>Sincronização em Nuvem</span>
        </button>

        <button 
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-rose-950/60 hover:text-rose-400 transition-all text-xs font-semibold cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sair do Painel</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ 
  icon, 
  label, 
  isActive, 
  badge,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={isActive ? 'text-white' : 'text-slate-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-950 text-blue-400 border border-blue-800'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
