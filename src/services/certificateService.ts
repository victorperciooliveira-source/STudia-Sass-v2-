import { getSupabaseClient } from '../lib/supabase';
import { Certificate, CreateCertificateDTO } from '../types';
import { scheduleService } from './scheduleService';

const CERT_STORAGE_KEY = 'studia_local_certificates';

function getLocalCertificates(): Certificate[] {
  try {
    const raw = localStorage.getItem(CERT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCertificates(list: Certificate[]): void {
  try {
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Falha ao salvar atestados localmente:', err);
  }
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export const certificateService = {
  async fetchCertificates(): Promise<{ data: Certificate[]; error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: getLocalCertificates(), error: null };
    }

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Aviso ao buscar atestados no Supabase:', error.message);
        return { data: getLocalCertificates(), error: null };
      }
      
      if (data) {
        saveLocalCertificates(data);
        return { data, error: null };
      }
      return { data: getLocalCertificates(), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: getLocalCertificates(), error };
    }
  },

  async createCertificate(dto: CreateCertificateDTO): Promise<{ data: Certificate | null; error: Error | null }> {
    const newLocalCert: Certificate = {
      id: 'cert-' + Date.now(),
      teacher_id: dto.teacher_id,
      teacher_name: dto.teacher_name,
      date: dto.date,
      reason: dto.reason,
      image_url: dto.image_url || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Salva localmente primeiro
    const current = getLocalCertificates();
    saveLocalCertificates([newLocalCert, ...current]);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: newLocalCert, error: null };
    }

    try {
      const payload: Record<string, unknown> = {
        teacher_name: dto.teacher_name,
        date: dto.date,
        reason: dto.reason,
        image_url: dto.image_url || null,
        status: 'pending',
      };

      if (dto.teacher_id && isValidUUID(dto.teacher_id)) {
        payload.teacher_id = dto.teacher_id;
      }

      const { data, error } = await supabase
        .from('certificates')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Aviso ao inserir no Supabase (mantido localmente):', error.message);
        return { data: newLocalCert, error: null };
      }

      if (data) {
        saveLocalCertificates([data, ...current.filter(c => c.id !== newLocalCert.id)]);
        return { data, error: null };
      }
      return { data: newLocalCert, error: null };
    } catch (err: unknown) {
      console.warn('Erro ao inserir atestado no Supabase:', err);
      return { data: newLocalCert, error: null };
    }
  },

  async approveCertificate(id: string): Promise<{ error: Error | null }> {
    // 1. Atualiza no cache local
    const current = getLocalCertificates();
    const target = current.find(c => c.id === id);
    const updated = current.map(c => c.id === id ? { ...c, status: 'approved' as const } : c);
    saveLocalCertificates(updated);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    try {
      // Se for ID gerado localmente
      if (!isValidUUID(id)) {
        return { error: null };
      }

      // 1. Get certificate details
      const { data: cert, error: fetchErr } = await supabase
        .from('certificates')
        .select('teacher_id, date')
        .eq('id', id)
        .single();

      if (fetchErr || !cert) {
        throw fetchErr || new Error('Atestado não encontrado');
      }

      // 2. Mark certificate as approved
      const { error: updateCertErr } = await supabase
        .from('certificates')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateCertErr) throw updateCertErr;

      // 3. Mark corresponding schedules as vacant ("vaga")
      if (cert.teacher_id) {
        await supabase
          .from('schedules')
          .update({ status: 'vaga' })
          .eq('teacher_id', cert.teacher_id)
          .eq('date', cert.date);
      }

      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },
};

