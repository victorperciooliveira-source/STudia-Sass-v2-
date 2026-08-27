import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, getSupabaseCredentials, reinitializeSupabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { profileService } from '../services/profileService';

export type { UserProfile, UserRole };

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | AuthError | null }>;
  signUp: (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole, 
    subject?: string
  ) => Promise<{ error: Error | AuthError | null; data?: { user: User | null; session: Session | null } }>;
  loginAsDemo: (role: UserRole, customName?: string, customEmail?: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateConfig: (url: string, key: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isConfigured: false,
  isAdmin: false,
  isTeacher: false,
  authError: null,
  signIn: async () => ({ error: new Error('Not configured') }),
  signUp: async () => ({ error: new Error('Not configured') }),
  loginAsDemo: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  updateConfig: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    const { profile: prof, error } = await profileService.fetchProfile(userId, userEmail);
    if (error) {
      setAuthError(error.message);
      setProfile(null);
      return null;
    }
    setAuthError(null);
    setProfile(prof);
    return prof;
  }, []);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setIsConfigured(creds.isConfigured);

    // Verificar se existe sessão de demonstração salva localmente
    const savedDemoProfile = localStorage.getItem('studia_demo_profile');
    if (savedDemoProfile) {
      try {
        const parsed = JSON.parse(savedDemoProfile);
        setProfile(parsed);
        setUser({
          id: parsed.id,
          app_metadata: {},
          user_metadata: { display_name: parsed.display_name, role: parsed.role },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: parsed.email,
        } as unknown as User);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('studia_demo_profile');
      }
    }

    if (!creds.isConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error('Erro ao recuperar sessão do Supabase:', err);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email ?? '');
        } else {
          setProfile(null);
          setAuthError(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase não está configurado. Insira suas credenciais.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
      return { error };
    }
    if (data.user) {
      const prof = await fetchProfile(data.user.id, data.user.email ?? '');
      if (!prof) {
        // Tenta sincronizar caso seja o primeiro login
        const metaRole = (data.user.user_metadata?.role as UserRole) || 'teacher';
        const metaName = data.user.user_metadata?.display_name || email.split('@')[0];
        const metaSubject = data.user.user_metadata?.subject || null;
        
        await profileService.upsertProfile({
          id: data.user.id,
          email: data.user.email || email,
          display_name: metaName,
          role: metaRole,
          subject: metaSubject,
        });

        await fetchProfile(data.user.id, data.user.email ?? '');
      }
    }
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    subject?: string
  ) => {
    setAuthError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase não está configurado. Insira suas credenciais.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          subject: subject || null,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    if (data.user) {
      // Gravação explícita no PostgreSQL para garantir persistência mesmo se trigger estiver desativada
      await profileService.upsertProfile({
        id: data.user.id,
        email,
        display_name: displayName,
        role,
        subject: subject || null,
      });

      await fetchProfile(data.user.id, email);
    }

    return { error: null, data };
  };

  const loginAsDemo = (role: UserRole, customName?: string, customEmail?: string) => {
    const demoProf: UserProfile = {
      id: role === 'admin' ? 'demo-admin-id' : 'demo-teacher-id',
      email: customEmail || (role === 'admin' ? 'coordenacao@escola.gov.br' : 'prof.miguel@escola.gov.br'),
      displayName: customName || (role === 'admin' ? 'Profa. Sofia Mendes (Diretoria)' : 'Prof. Miguel Silva'),
      role,
      subject: role === 'teacher' ? 'Matemática' : null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('studia_demo_profile', JSON.stringify(demoProf));
    setProfile(demoProf);
    setUser({
      id: demoProf.id,
      app_metadata: {},
      user_metadata: { display_name: demoProf.displayName, role: demoProf.role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: demoProf.email,
    } as unknown as User);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('studia_demo_profile');
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setAuthError(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email ?? '');
    }
  };

  const updateConfig = (url: string, key: string) => {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', key.trim());
    reinitializeSupabase();
    const creds = getSupabaseCredentials();
    setIsConfigured(creds.isConfigured);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        isAdmin: profile?.role === 'admin',
        isTeacher: profile?.role === 'teacher',
        authError,
        signIn,
        signUp,
        loginAsDemo,
        signOut,
        refreshProfile,
        updateConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
