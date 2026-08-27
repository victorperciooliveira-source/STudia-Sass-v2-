import { getSupabaseClient } from '../lib/supabase';
import { Schedule, CreateScheduleDTO, ScheduleStatus, ScheduleStats } from '../types';

const LOCAL_STORAGE_KEY = 'studia_local_schedules';

function getLocalSchedules(): Schedule[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalSchedules(schedules: Schedule[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.warn('Falha ao salvar horários no localStorage:', e);
  }
}

function getDayOfWeekName(dateStr: string): string {
  try {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return days[d.getDay()] || 'Segunda-feira';
    }
    return 'Segunda-feira';
  } catch {
    return 'Segunda-feira';
  }
}

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

export const scheduleService = {
  async fetchSchedules(teacherId?: string): Promise<{ data: Schedule[]; error: Error | null }> {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      const local = getLocalSchedules();
      const filtered = teacherId ? local.filter(s => s.teacher_id === teacherId) : local;
      return { data: filtered, error: null };
    }

    try {
      let query = supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: false });

      if (teacherId && isValidUUID(teacherId)) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Aviso ao consultar Supabase:', error.message || error);
        return { data: [], error: new Error(error.message) };
      }
      
      saveLocalSchedules(data || []);
      return { data: data || [], error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('Falha na query do Supabase:', error.message);
      return { data: [], error };
    }
  },

  async fetchTeacherSchedules(teacherId: string, teacherName?: string): Promise<{ data: Schedule[]; error: Error | null }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      const local = getLocalSchedules();
      const localFiltered = local.filter(s => 
        s.teacher_id === teacherId || 
        (teacherName && s.teacher_name.toLowerCase().includes(teacherName.toLowerCase().trim()))
      );
      return { data: localFiltered, error: null };
    }

    try {
      let query = supabase.from('schedules').select('*');
      if (isValidUUID(teacherId)) {
        if (teacherName && teacherName.trim().length > 0) {
          query = query.or(`teacher_id.eq.${teacherId},teacher_name.ilike.%${teacherName.trim()}%`);
        } else {
          query = query.eq('teacher_id', teacherId);
        }
      } else if (teacherName && teacherName.trim().length > 0) {
        query = query.ilike('teacher_name', `%${teacherName.trim()}%`);
      }

      const { data, error } = await query.order('date', { ascending: true });
      if (error) {
        console.warn('Aviso ao buscar aulas do professor no Supabase:', error.message || error);
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('Falha ao consultar aulas do professor:', error.message);
      return { data: [], error };
    }
  },

  async createSchedule(dto: CreateScheduleDTO): Promise<{ data: Schedule | null; error: Error | null }> {
    const dayOfWeek = getDayOfWeekName(dto.date);
    const validTeacherId = (dto.teacher_id && isValidUUID(dto.teacher_id)) ? dto.teacher_id.trim() : null;

    const newLocalItem: Schedule = {
      id: 'sch-' + Date.now(),
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      subject: dto.subject,
      room: dto.room,
      class_group: dto.class_group || '',
      teacher_id: validTeacherId,
      teacher_name: dto.teacher_name || 'Docente Responsável',
      status: dto.status || 'pending',
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      const currentList = getLocalSchedules();
      saveLocalSchedules([newLocalItem, ...currentList]);
      return { data: newLocalItem, error: null };
    }

    try {
      const payload: Record<string, unknown> = {
        date: dto.date,
        day_of_week: dayOfWeek,
        start_time: dto.start_time,
        end_time: dto.end_time,
        subject: dto.subject,
        room: dto.room,
        class_group: dto.class_group || '',
        teacher_name: dto.teacher_name,
        status: dto.status || 'pending',
      };

      if (validTeacherId) {
        payload.teacher_id = validTeacherId;
      }

      const { data, error } = await supabase
        .from('schedules')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('Aviso: erro ao inserir no Supabase:', error.message || error);
        return { data: null, error: new Error(error.message) };
      }

      const createdItem = data || newLocalItem;
      const currentList = getLocalSchedules();
      saveLocalSchedules([createdItem, ...currentList.filter(s => s.id !== createdItem.id)]);
      return { data: createdItem, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('Erro ao inserir no Supabase:', error.message);
      return { data: null, error };
    }
  },

  async bulkCreateSchedules(dtos: CreateScheduleDTO[]): Promise<{ count: number; error: Error | null }> {
    const supabase = getSupabaseClient();
    
    const itemsToInsert = dtos.map(dto => {
      const validTeacherId = (dto.teacher_id && isValidUUID(dto.teacher_id)) ? dto.teacher_id.trim() : null;
      const payload: Record<string, unknown> = {
        date: dto.date,
        day_of_week: getDayOfWeekName(dto.date),
        start_time: dto.start_time,
        end_time: dto.end_time,
        subject: dto.subject,
        room: dto.room,
        class_group: dto.class_group || '',
        teacher_name: dto.teacher_name || 'Docente Responsável',
        status: dto.status || 'pending',
      };
      if (validTeacherId) {
        payload.teacher_id = validTeacherId;
      }
      return payload;
    });

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .insert(itemsToInsert)
          .select();

        if (error) {
          throw error;
        }

        if (data) {
          const currentList = getLocalSchedules();
          saveLocalSchedules([...data, ...currentList]);
          return { count: data.length, error: null };
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        return { count: 0, error };
      }
    }

    // Se offline / demo local
    const newLocalItems: Schedule[] = dtos.map((dto, idx) => ({
      id: `sch-${Date.now()}-${idx}`,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      subject: dto.subject,
      room: dto.room,
      class_group: dto.class_group || '',
      teacher_id: dto.teacher_id || null,
      teacher_name: dto.teacher_name || 'Docente Responsável',
      status: dto.status || 'pending',
      created_at: new Date().toISOString(),
    }));

    const currentList = getLocalSchedules();
    saveLocalSchedules([...newLocalItems, ...currentList]);
    return { count: newLocalItems.length, error: null };
  },

  async updateScheduleStatus(id: string, status: ScheduleStatus): Promise<{ error: Error | null }> {
    const list = getLocalSchedules();
    saveLocalSchedules(list.map(s => s.id === id ? { ...s, status } : s));

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.warn('Aviso ao atualizar status no Supabase:', error.message || error);
      }
      return { error: null };
    } catch (err: unknown) {
      console.warn('Erro na atualização remota do status:', err);
      return { error: null };
    }
  },

  async substituteTeacher(
    scheduleId: string, 
    newTeacherId: string | null, 
    newTeacherName: string
  ): Promise<{ error: Error | null }> {
    const list = getLocalSchedules();
    saveLocalSchedules(list.map(s => s.id === scheduleId ? {
      ...s,
      teacher_id: newTeacherId,
      teacher_name: `${newTeacherName} (Subst.)`,
      status: 'confirmed'
    } : s));

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    try {
      const payload: Record<string, unknown> = {
        teacher_name: `${newTeacherName} (Subst.)`,
        status: 'confirmed',
      };
      if (newTeacherId && isValidUUID(newTeacherId)) {
        payload.teacher_id = newTeacherId;
      }

      const { error } = await supabase
        .from('schedules')
        .update(payload)
        .eq('id', scheduleId);

      if (error) {
        console.warn('Aviso ao registrar substituição no Supabase:', error.message || error);
      }
      return { error: null };
    } catch (err: unknown) {
      console.warn('Erro ao substituir professor:', err);
      return { error: null };
    }
  },

  /**
   * Reorganiza a grade da turma para evitar "janelas" (horários vagos no meio do dia).
   * Puxa as aulas subsequentes para cima e move a aula vaga para o último horário do período.
   */
  async shiftVacantToDayEnd(vacantScheduleId: string): Promise<{ success: boolean; affectedCount: number; message: string; error: Error | null }> {
    const list = getLocalSchedules();
    const target = list.find(s => s.id === vacantScheduleId);
    if (!target) {
      return { success: false, affectedCount: 0, message: 'Aula não encontrada.', error: new Error('Aula não encontrada') };
    }

    // Busca todas as aulas daquela turma (ou sala) no mesmo dia
    const sameDaySchedules = list
      .filter(s => s.date === target.date && (target.class_group ? s.class_group === target.class_group : s.room === target.room))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (sameDaySchedules.length <= 1) {
      return { success: false, affectedCount: 0, message: 'Esta turma só possui uma aula cadastrada no dia.', error: null };
    }

    const targetIndex = sameDaySchedules.findIndex(s => s.id === vacantScheduleId);
    if (targetIndex === -1) {
      return { success: false, affectedCount: 0, message: 'Aula não localizada na grade do dia.', error: null };
    }

    if (targetIndex === sameDaySchedules.length - 1) {
      // Já é a última aula do dia
      await this.updateScheduleStatus(target.id, 'vaga');
      return { success: true, affectedCount: 1, message: 'A aula vaga já está no último horário do dia (turma liberada mais cedo).', error: null };
    }

    // Reorganização dos horários (empurra as aulas seguintes para cima e joga o vago para o final)
    // Coleta a sequência de faixas de horários
    const timeSlots = sameDaySchedules.map(s => ({ start_time: s.start_time, end_time: s.end_time }));

    // Array de aulas reorganizado:
    // Mantém as anteriores ao alvo inalteradas
    const before = sameDaySchedules.slice(0, targetIndex);
    // As aulas subsequentes sobem 1 posição
    const after = sameDaySchedules.slice(targetIndex + 1);
    // A aula vaga vai para a última posição
    const reorderedItems = [...before, ...after, { ...target, status: 'vaga' as const }];

    // Aplica os timeSlots ordenados para cada aula reorganizada
    const updatedSchedules = reorderedItems.map((item, idx) => ({
      ...item,
      start_time: timeSlots[idx].start_time,
      end_time: timeSlots[idx].end_time,
    }));

    // Atualiza localmente
    const updatedMap = new Map(updatedSchedules.map(s => [s.id, s]));
    const newList = list.map(s => updatedMap.get(s.id) || s);
    saveLocalSchedules(newList);

    // Atualiza no Supabase se conectado
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        for (const item of updatedSchedules) {
          if (isValidUUID(item.id)) {
            await supabase
              .from('schedules')
              .update({
                start_time: item.start_time,
                end_time: item.end_time,
                status: item.status,
              })
              .eq('id', item.id);
          }
        }
      } catch (err) {
        console.warn('Aviso ao sincronizar reorganização de horários no banco:', err);
      }
    }

    return {
      success: true,
      affectedCount: updatedSchedules.length,
      message: `Grade reorganizada com sucesso! Aulas antecipadas e horário vago movido para o término do dia (${timeSlots[timeSlots.length - 1].start_time} - ${timeSlots[timeSlots.length - 1].end_time}).`,
      error: null
    };
  },

  async deleteSchedule(id: string): Promise<{ error: Error | null }> {
    const list = getLocalSchedules();
    saveLocalSchedules(list.filter(s => s.id !== id));

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Aviso ao deletar do Supabase:', error.message || error);
      }
      return { error: null };
    } catch (err: unknown) {
      console.warn('Erro ao deletar horário:', err);
      return { error: null };
    }
  },

  computeStats(schedules: Schedule[]): ScheduleStats {
    const total = schedules.length;
    const confirmed = schedules.filter(s => s.status === 'confirmed').length;
    const absent = schedules.filter(s => s.status === 'absent').length;
    const pending = schedules.filter(s => s.status === 'pending').length;
    const vaga = schedules.filter(s => s.status === 'vaga').length;

    const presenceRate = total > 0 ? Math.round((confirmed / total) * 100) : 100;

    const chartData = [
      { name: 'Confirmado', value: confirmed, color: '#10b981' },
      { name: 'Pendente', value: pending, color: '#f59e0b' },
      { name: 'Ausente', value: absent, color: '#f43f5e' },
      { name: 'Aula Vaga', value: vaga, color: '#6366f1' },
    ];

    return { total, confirmed, absent, pending, vaga, presenceRate, chartData };
  },
};

