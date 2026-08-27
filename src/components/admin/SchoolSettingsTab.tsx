import React, { useState } from 'react';
import { SchoolTenant, Schedule } from '../../types';
import { tenantService } from '../../services/tenantService';
import { 
  Building2, 
  ShieldCheck, 
  Palette, 
  Download, 
  Sparkles, 
  Check, 
  Lock,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';

interface SchoolSettingsTabProps {
  currentSchool: SchoolTenant;
  schedules: Schedule[];
  onSchoolUpdated: (school: SchoolTenant) => void;
}

export default function SchoolSettingsTab({ currentSchool, schedules, onSchoolUpdated }: SchoolSettingsTabProps) {
  const [schoolName, setSchoolName] = useState(currentSchool.name);
  const [cnpj, setCnpj] = useState(currentSchool.cnpj || '12.345.678/0001-90');
  const [city, setCity] = useState(currentSchool.city);
  const [state, setState] = useState(currentSchool.state);
  const [primaryColor, setPrimaryColor] = useState(currentSchool.primaryColor || '#2563eb');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const allSchools = tenantService.getAllSchools();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolTenant = {
      ...currentSchool,
      name: schoolName,
      cnpj,
      city,
      state,
      primaryColor,
    };
    tenantService.setActiveSchool(updated);
    onSchoolUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSwitchTenant = (s: SchoolTenant) => {
    tenantService.setActiveSchool(s);
    onSchoolUpdated(s);
    setSchoolName(s.name);
    setCnpj(s.cnpj || '');
    setCity(s.city);
    setState(s.state);
    setPrimaryColor(s.primaryColor || '#2563eb');
  };

  const handleExportBackup = () => {
    tenantService.exportCompleteSchoolBackup(currentSchool, schedules);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header com Status do Plano / Trial */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} /> Trial Ativo (14 Dias Restantes)
            </span>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
              Multi-Tenant Isolado
            </span>
          </div>
          <h3 className="text-2xl font-bold font-display mt-3">{currentSchool.name}</h3>
          <p className="text-xs text-slate-300 mt-1">
            Código do Tenant: <span className="font-mono text-emerald-400 font-bold">{currentSchool.code}</span> • CNPJ: {currentSchool.cnpj}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Exportar Backup (JSON/LGPD)</span>
          </button>
        </div>
      </div>

      {/* Multi-tenant Switcher (Rede de Escolas) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              <span>Alternar Unidade / Escola da Rede (Multi-Tenant)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Alterne instantaneamente entre os ambientes cadastrados na sua conta de gestor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allSchools.map((school) => {
            const isSelected = school.id === currentSchool.id;
            return (
              <div
                key={school.id}
                onClick={() => handleSwitchTenant(school)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{school.name}</span>
                  {isSelected && <Check size={14} className="text-blue-600" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {school.city} - {school.state} • <span className="font-mono text-slate-700 font-bold">{school.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customização White-Label */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette size={18} className="text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">Customização White-Label & Dados Oficiais</h4>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome Oficial da Escola / Colégio</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CNPJ Institucional</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Cor Primária (Identidade)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="text-xs font-mono text-slate-600">{primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">UF (Estado)</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold uppercase"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                Configurações da escola e identidade visual salvas!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Salvar Dados Institucionais</span>
            </button>
          </form>
        </div>

        {/* Segurança, RBAC e LGPD */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Segurança, RBAC e Conformidade LGPD</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-blue-600" /> Níveis de Acesso Granulares (RBAC)
              </div>
              <ul className="space-y-1 text-slate-500 pl-4 list-disc text-[11px]">
                <li><strong>Super Admin:</strong> Gestão de múltiplas unidades escolares e faturamento.</li>
                <li><strong>Diretoria / Coordenação:</strong> Grade, substituições, aprovação de laboratórios.</li>
                <li><strong>Professor:</strong> Check-in de presença, atestados médicos e permutas.</li>
                <li><strong>Secretaria / RH:</strong> Relatórios de fechamento de folha de aulas.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <FileCheck size={13} className="text-emerald-600" /> Política de Privacidade & LGPD
              </div>
              <p className="text-slate-500 text-[11px]">
                Os dados de presença e os atestados médicos são criptografados em repouso e trafegam sob SSL/TLS 256-bit com consentimento explícito do corpo docente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
