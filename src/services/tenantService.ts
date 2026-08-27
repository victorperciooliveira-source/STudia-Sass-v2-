import { SchoolTenant, ClassSwapRequest, WhatsAppNotification, Schedule } from '../types';
import { getSupabaseClient } from '../lib/supabase';

export const DEMO_SCHOOLS: SchoolTenant[] = [
  {
    id: 'school-colegio-modelo',
    name: 'Colégio Estadual Modelo',
    code: 'CEM-01',
    cnpj: '12.345.678/0001-90',
    city: 'Curitiba',
    state: 'PR',
    primaryColor: '#2563eb',
    activePlan: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-liceu-inovacao',
    name: 'Liceu de Inovação & Tecnologia',
    code: 'LIT-02',
    cnpj: '98.765.432/0001-11',
    city: 'São Paulo',
    state: 'SP',
    primaryColor: '#059669',
    activePlan: 'pro',
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'school-instituto-educar',
    name: 'Instituto Educar Brasil',
    code: 'IEB-03',
    cnpj: '45.123.890/0001-55',
    city: 'Belo Horizonte',
    state: 'MG',
    primaryColor: '#7c3aed',
    activePlan: 'enterprise',
    trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const TENANT_KEY = 'studia_active_school_tenant';
const SWAPS_KEY = 'studia_class_swaps';
const NOTIFS_KEY = 'studia_whatsapp_notifications';

export const tenantService = {
  getActiveSchool(): SchoolTenant {
    try {
      const saved = localStorage.getItem(TENANT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEMO_SCHOOLS[0];
  },

  setActiveSchool(school: SchoolTenant) {
    localStorage.setItem(TENANT_KEY, JSON.stringify(school));
  },

  getAllSchools(): SchoolTenant[] {
    return DEMO_SCHOOLS;
  },

  // Chat & Notification Center
  getWhatsAppNotifications(): WhatsAppNotification[] {
    try {
      const saved = localStorage.getItem(NOTIFS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  },

  sendWhatsAppNotification(notif: Omit<WhatsAppNotification, 'id' | 'timestamp' | 'status'>): WhatsAppNotification {
    const current = this.getWhatsAppNotifications();
    const newNotif: WhatsAppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      status: 'sent',
      timestamp: new Date().toISOString(),
    };
    const updated = [newNotif, ...current];
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));

    // Se Supabase estiver conectado, persiste também no banco
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('notifications').insert({
        recipient_name: notif.recipient_name,
        phone: notif.phone,
        message: notif.message,
        type: notif.type,
        status: 'sent',
      }).then(({ error }) => {
        if (error) console.warn('Aviso ao sincronizar notificação com o banco:', error.message);
      });
    }

    return newNotif;
  },

  // Class Swap Engine (Permutas)
  getSwapRequests(): ClassSwapRequest[] {
    try {
      const saved = localStorage.getItem(SWAPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  },

  createSwapRequest(req: Omit<ClassSwapRequest, 'id' | 'status' | 'created_at'>): ClassSwapRequest {
    const current = this.getSwapRequests();
    const newSwap: ClassSwapRequest = {
      ...req,
      id: 'swap-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const updated = [newSwap, ...current];
    localStorage.setItem(SWAPS_KEY, JSON.stringify(updated));

    // Persiste no Supabase caso conectado
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('class_swaps').insert({
        school_id: req.school_id,
        requester_name: req.requester_name,
        target_teacher_name: req.target_teacher_name,
        requester_schedule_info: req.requester_schedule_info,
        target_schedule_info: req.target_schedule_info,
        reason: req.reason,
        status: 'pending',
      }).then(({ error }) => {
        if (error) console.warn('Aviso ao sincronizar permuta com o banco:', error.message);
      });
    }

    // Dispara notificação no Chat
    this.sendWhatsAppNotification({
      recipient_name: req.target_teacher_name,
      phone: '+55 (11) 98888-7777',
      message: `🔄 Olá ${req.target_teacher_name}! ${req.requester_name} solicitou uma permuta de aula com você: ${req.requester_schedule_info}. Acesse o Studia para aceitar ou recusar.`,
      type: 'swap_request'
    });

    return newSwap;
  },

  updateSwapStatus(swapId: string, status: 'accepted' | 'rejected'): void {
    const current = this.getSwapRequests();
    const updated = current.map(s => s.id === swapId ? { ...s, status } : s);
    localStorage.setItem(SWAPS_KEY, JSON.stringify(updated));
  },

  // Export Full School Year Backup
  exportCompleteSchoolBackup(school: SchoolTenant, schedules: Schedule[]) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      version: "Studia SaaS Enterprise 2.5",
      exportedAt: new Date().toISOString(),
      school,
      schedulesCount: schedules.length,
      schedules,
      systemCheck: "Conforme LGPD & MEC"
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_studia_${school.code}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};

