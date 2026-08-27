import { getSupabaseClient } from '../lib/supabase';
import { LabBooking, CreateLabBookingDTO } from '../types';

const LABS_STORAGE_KEY = 'studia_local_lab_bookings';

function getLocalLabBookings(): LabBooking[] {
  try {
    const raw = localStorage.getItem(LABS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLabBookings(list: LabBooking[]): void {
  try {
    localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Falha ao salvar reservas de laboratório:', err);
  }
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export const labService = {
  async fetchBookings(): Promise<{ data: LabBooking[]; error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: getLocalLabBookings(), error: null };
    }

    try {
      const { data, error } = await supabase
        .from('lab_bookings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.warn('Aviso ao buscar reservas no Supabase:', error.message);
        return { data: getLocalLabBookings(), error: null };
      }

      if (data) {
        saveLocalLabBookings(data);
        return { data, error: null };
      }
      return { data: getLocalLabBookings(), error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { data: getLocalLabBookings(), error };
    }
  },

  async createBooking(dto: CreateLabBookingDTO): Promise<{ data: LabBooking | null; error: Error | null }> {
    const newLocalBooking: LabBooking = {
      id: 'booking-' + Date.now(),
      lab_id: dto.lab_id,
      teacher_id: dto.teacher_id,
      teacher_name: dto.teacher_name,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      created_at: new Date().toISOString(),
    };

    const current = getLocalLabBookings();
    saveLocalLabBookings([newLocalBooking, ...current]);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: newLocalBooking, error: null };
    }

    try {
      const payload: Record<string, unknown> = {
        lab_id: dto.lab_id,
        teacher_name: dto.teacher_name,
        date: dto.date,
        start_time: dto.start_time,
        end_time: dto.end_time,
      };

      if (dto.teacher_id && isValidUUID(dto.teacher_id)) {
        payload.teacher_id = dto.teacher_id;
      }

      const { data, error } = await supabase
        .from('lab_bookings')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Aviso ao inserir reserva no Supabase (mantida localmente):', error.message);
        return { data: newLocalBooking, error: null };
      }

      if (data) {
        saveLocalLabBookings([data, ...current.filter(b => b.id !== newLocalBooking.id)]);
        return { data, error: null };
      }
      return { data: newLocalBooking, error: null };
    } catch (err: unknown) {
      console.warn('Erro ao reservar no Supabase:', err);
      return { data: newLocalBooking, error: null };
    }
  },

  async deleteBooking(id: string): Promise<{ error: Error | null }> {
    const current = getLocalLabBookings();
    saveLocalLabBookings(current.filter(b => b.id !== id));

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    try {
      if (isValidUUID(id)) {
        const { error } = await supabase
          .from('lab_bookings')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },
};

