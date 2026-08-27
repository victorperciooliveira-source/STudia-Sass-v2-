import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import SupabaseConfigModal from './SupabaseConfigModal';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar, { AdminTab } from './admin/AdminSidebar';
import { AdminStatsCards } from './admin/AdminStats';
import ScheduleTable from './admin/ScheduleTable';
import ScheduleFormModal from './admin/ScheduleFormModal';
import AdminSubstitutions from './admin/AdminSubstitutions';
import AdminLabs from './admin/AdminLabs';
import AdminCertificates from './admin/AdminCertificates';
import AdminReportsAndPrint from './admin/AdminReportsAndPrint';
import AdminWhatsAppCenter from './admin/AdminWhatsAppCenter';
import SchoolSettingsTab from './admin/SchoolSettingsTab';
import BulkImportModal from './admin/BulkImportModal';
import { scheduleService } from '../services/scheduleService';
import { profileService } from '../services/profileService';
import { tenantService } from '../services/tenantService';
import { Schedule, TeacherProfile, CreateScheduleDTO, SchoolTenant } from '../types';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('schedules');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<SchoolTenant>(tenantService.getActiveSchool());

  const stats = useMemo(() => scheduleService.computeStats(schedules), [schedules]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [schedulesRes, teachersRes] = await Promise.all([
        scheduleService.fetchSchedules(),
        profileService.fetchTeachers(),
      ]);

      if (schedulesRes.data) {
        setSchedules(schedulesRes.data);
      }
      if (teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (err) {
      console.error('Error loading admin data from Supabase:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchedule = async (dto: CreateScheduleDTO) => {
    try {
      const { data, error } = await scheduleService.createSchedule(dto);
      if (error) {
        console.warn('Aviso ao criar horário:', error.message || error);
      }
      if (data) {
        setSchedules(prev => [data, ...prev.filter(s => s.id !== data.id)]);
      }
      await loadData();
    } catch (err: unknown) {
      console.warn('Erro ao processar criação de horário:', err);
      await loadData();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta aula da grade?')) return;
    try {
      setSchedules(prev => prev.filter(s => s.id !== id));
      await scheduleService.deleteSchedule(id);
      await loadData();
    } catch (err) {
      console.warn('Erro ao deletar horário:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar de Gestão Escolar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Superior */}
        <AdminHeader
          profile={profile}
          loadingData={loadingData}
          onRefresh={loadData}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {activeTab === 'schedules' && (
            <>
              {/* Top Stats Cards */}
              <AdminStatsCards stats={stats} />

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">Grade Horária Geral</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Unidade: <span className="text-blue-600 font-bold">{currentSchool.name}</span> ({currentSchool.city} - {currentSchool.state})
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setIsBulkOpen(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-4 py-3 rounded-2xl flex items-center gap-2 shadow-xs transition-all cursor-pointer text-xs"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>Importar Planilha (Excel/CSV)</span>
                  </button>

                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-xs"
                  >
                    <Plus size={16} />
                    <span>Novo Horário</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Horários */}
              <ScheduleTable
                schedules={schedules}
                onOpenNewModal={() => setIsModalOpen(true)}
                onDeleteSchedule={handleDeleteSchedule}
              />
            </>
          )}

          {activeTab === 'substitutions' && (
            <AdminSubstitutions
              schedules={schedules}
              teachers={teachers}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'whatsapp' && (
            <AdminWhatsAppCenter teachers={teachers} />
          )}

          {activeTab === 'labs' && (
            <AdminLabs teachers={teachers} />
          )}

          {activeTab === 'certificates' && (
            <AdminCertificates onRefreshSchedules={loadData} />
          )}

          {activeTab === 'reports' && (
            <AdminReportsAndPrint stats={stats} schedules={schedules} />
          )}

          {activeTab === 'settings' && (
            <SchoolSettingsTab
              currentSchool={currentSchool}
              schedules={schedules}
              onSchoolUpdated={setCurrentSchool}
            />
          )}
        </main>
      </div>

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teachers={teachers}
        onSubmit={handleCreateSchedule}
      />

      {/* Bulk CSV Import Modal */}
      <BulkImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onImportSuccess={() => loadData()}
      />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onSaved={loadData}
      />
    </div>
  );
}
