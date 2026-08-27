import { getSupabaseClient } from '../lib/supabase';
import { TeacherProfile, UserProfile, UserRole } from '../types';

export const profileService = {
  /**
   * Busca lista de professores cadastrados no sistema diretamente do banco de dados
   */
  async fetchTeachers(): Promise<{ data: TeacherProfile[]; error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: [], error: null };
    }

    try {
      // 1. Tenta buscar professores através de user_roles + profiles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      let teacherIds: string[] = [];
      if (!roleError && roleData && roleData.length > 0) {
        teacherIds = roleData.map(r => r.user_id);
      }

      let query = supabase.from('profiles').select('id, display_name, email, subject');
      if (teacherIds.length > 0) {
        query = query.in('id', teacherIds);
      }

      const { data, error } = await query.order('display_name', { ascending: true });

      if (error) {
        console.warn('Aviso ao buscar professores no Supabase:', error.message || error);
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('Falha na consulta de professores no banco:', error.message);
      return { data: [], error };
    }
  },

  /**
   * Obtém o perfil completo do usuário e suas roles
   */
  async fetchProfile(userId: string, userEmail: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { profile: null, error: new Error('Supabase client não configurado.') };
    }

    try {
      // Buscar Perfil do Usuário
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profError) throw profError;

      // Buscar Papéis na tabela user_roles
      let detectedRoles: UserRole[] = [];
      try {
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (!rolesError && rolesData && rolesData.length > 0) {
          detectedRoles = rolesData.map(r => r.role as UserRole);
        }
      } catch (rErr) {
        console.warn('Tabela user_roles não acessível ou vazia, usando fallback:', rErr);
      }

      // Se perfil ainda não foi criado pelo trigger, cria sob demanda
      if (!profData) {
        const defaultRole: UserRole = userEmail.includes('admin') || userEmail.includes('diretor') ? 'admin' : 'teacher';
        const newProf = {
          id: userId,
          email: userEmail,
          display_name: userEmail.split('@')[0],
          subject: null,
        };

        await supabase.from('profiles').upsert(newProf);
        await supabase.from('user_roles').upsert({ user_id: userId, role: defaultRole });

        return {
          profile: {
            id: userId,
            email: userEmail,
            displayName: newProf.display_name,
            role: defaultRole,
            roles: [defaultRole],
            subject: null,
            createdAt: new Date().toISOString(),
          },
          error: null,
        };
      }

      // Determinar papel principal (prioriza admin se tiver múltiplos)
      let primaryRole: UserRole = 'teacher';
      if (detectedRoles.includes('admin') || (profData as { role?: string }).role === 'admin') {
        primaryRole = 'admin';
      } else if (detectedRoles.includes('teacher') || (profData as { role?: string }).role === 'teacher') {
        primaryRole = 'teacher';
      } else {
        primaryRole = userEmail.includes('admin') || userEmail.includes('diretor') ? 'admin' : 'teacher';
      }

      const userProfile: UserProfile = {
        id: profData.id,
        email: profData.email || userEmail,
        displayName: profData.display_name || userEmail.split('@')[0],
        role: primaryRole,
        roles: detectedRoles.length > 0 ? detectedRoles : [primaryRole],
        subject: profData.subject || null,
        avatarUrl: profData.avatar_url || null,
        createdAt: profData.created_at || new Date().toISOString(),
      };

      return { profile: userProfile, error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Erro ao consultar profile no Supabase PostgreSQL:', error);
      return { profile: null, error };
    }
  },

  /**
   * Atualiza ou cadastra perfil e papel isolado
   */
  async upsertProfile(profile: {
    id: string;
    email: string;
    display_name: string;
    role: UserRole;
    subject?: string | null;
  }): Promise<{ error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase client não configurado.') };
    }

    try {
      // 1. Atualizar profiles
      const { error: profErr } = await supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        subject: profile.subject || null,
      });
      if (profErr) throw profErr;

      // 2. Atualizar user_roles
      const { error: roleErr } = await supabase.from('user_roles').upsert({
        user_id: profile.id,
        role: profile.role,
      });
      if (roleErr) console.warn('Aviso ao sincronizar user_roles:', roleErr);

      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  },
};
