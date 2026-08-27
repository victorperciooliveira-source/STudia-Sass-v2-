import React, { useState } from 'react';
import { getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials, sanitizeSupabaseUrl } from '../lib/supabase';
import { Database, Key, Globe, Check, Copy, AlertTriangle, X, Terminal, ExternalLink, ShieldCheck, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SupabaseConfigModal({ isOpen, onClose, onSaved }: SupabaseConfigModalProps) {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');
  const [autoFixed, setAutoFixed] = useState(false);
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = (value: string) => {
    setTestResult(null);
    const cleaned = sanitizeSupabaseUrl(value);
    if (cleaned !== value && value.includes('dashboard/project')) {
      setUrl(cleaned);
      setAutoFixed(true);
    } else {
      setUrl(value);
      setAutoFixed(false);
    }
  };

  const handleTestConnection = async () => {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = key.trim().replace(/['"]/g, '');

    if (!cleanUrl || !cleanKey) {
      setTestResult({ success: false, message: 'Preencha a URL e a Anon Key para testar.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const client = createClient(cleanUrl, cleanKey);
      const { error } = await client.auth.getSession();

      if (error) {
        setTestResult({ success: false, message: `Erro ao conectar: ${error.message}` });
      } else {
        setTestResult({ success: true, message: 'Conexão com o servidor estabelecida com sucesso!' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão.';
      setTestResult({ success: false, message: `Erro: ${msg}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = key.trim().replace(/['"]/g, '');
    saveSupabaseCredentials(cleanUrl, cleanKey);
    if (onSaved) onSaved();
    window.location.reload();
  };

  const handleClear = () => {
    if (confirm('Deseja realmente remover as credenciais salvas do Supabase?')) {
      clearSupabaseCredentials();
      setUrl('');
      setKey('');
      setTestResult(null);
      window.location.reload();
    }
  };

  const sqlSchema = `-- ============================================================
-- STUDIA - SCHEMA POSTGRESQL DEFINITIVO PARA SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Tabela de Perfis de Usuários (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  subject text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Papéis/Roles Separados por Segurança (RBAC)
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'teacher')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role)
);

-- 4. Tabela de Grade de Horários (Schedules)
create table if not exists public.schedules (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  start_time text not null,
  end_time text not null,
  subject text not null,
  room text not null,
  class_group text default '',
  teacher_id uuid references auth.users(id) on delete set null,
  teacher_name text not null,
  status text not null check (status in ('pending', 'confirmed', 'absent', 'vaga')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Reservas de Laboratórios (Lab Bookings)
create table if not exists public.lab_bookings (
  id uuid default gen_random_uuid() primary key,
  lab_id text not null,
  teacher_id uuid references auth.users(id) on delete cascade not null,
  teacher_name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Atestados / Licenças (Certificates)
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references auth.users(id) on delete set null,
  teacher_name text not null,
  date date not null,
  reason text not null,
  image_url text,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Mensagens & Alertas do Chat
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_name text not null,
  phone text not null,
  message text not null,
  type text not null,
  status text not null default 'sent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tabela de Pedidos de Permuta de Aulas
create table if not exists public.class_swaps (
  id uuid default gen_random_uuid() primary key,
  school_id text default 'school-colegio-modelo',
  requester_id text,
  requester_name text not null,
  target_teacher_id text,
  target_teacher_name text not null,
  requester_schedule_id text,
  requester_schedule_info text not null,
  target_schedule_id text,
  target_schedule_info text not null,
  reason text not null,
  status text not null check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Função de Verificação de Permissões (Security Definer com search_path explícito)
create or replace function public.has_role(user_uuid uuid, required_role text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 
    from public.user_roles 
    where user_id = user_uuid and role = required_role
  );
$$;

-- 10. Ativar Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.schedules enable row level security;
alter table public.lab_bookings enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.class_swaps enable row level security;

-- 11. Políticas de RLS
drop policy if exists "Profiles visíveis por usuários autenticados" on public.profiles;
drop policy if exists "Usuário pode atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Inserção de perfil autenticado" on public.profiles;

create policy "Profiles visíveis por usuários autenticados" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Usuário pode atualizar seu próprio perfil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Inserção de perfil autenticado" on public.profiles for insert with check (auth.uid() = id or auth.role() = 'authenticated');

drop policy if exists "Usuários podem ver seus próprios papéis ou admin vê todos" on public.user_roles;
drop policy if exists "Inserção de papel permitida na criação" on public.user_roles;
drop policy if exists "Admins podem gerenciar papéis" on public.user_roles;

create policy "Usuários podem ver seus próprios papéis ou admin vê todos" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or auth.role() = 'authenticated');
create policy "Inserção de papel permitida na criação" on public.user_roles for insert with check (auth.uid() = user_id or auth.role() = 'authenticated');
create policy "Admins podem gerenciar papéis" on public.user_roles for all using (public.has_role(auth.uid(), 'admin') or auth.uid() = user_id);

drop policy if exists "Horários visíveis por todos autenticados" on public.schedules;
drop policy if exists "Usuários autenticados podem inserir horários" on public.schedules;
drop policy if exists "Usuários autenticados podem atualizar horários" on public.schedules;
drop policy if exists "Usuários autenticados podem deletar horários" on public.schedules;

create policy "Horários visíveis por todos autenticados" on public.schedules for select using (auth.role() = 'authenticated');
create policy "Usuários autenticados podem inserir horários" on public.schedules for insert with check (auth.role() = 'authenticated');
create policy "Usuários autenticados podem atualizar horários" on public.schedules for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Usuários autenticados podem deletar horários" on public.schedules for delete using (auth.role() = 'authenticated');

drop policy if exists "Reservas de laboratório visíveis" on public.lab_bookings;
drop policy if exists "Usuários autenticados gerenciam reservas" on public.lab_bookings;

create policy "Reservas de laboratório visíveis" on public.lab_bookings for select using (auth.role() = 'authenticated');
create policy "Usuários autenticados gerenciam reservas" on public.lab_bookings for all using (auth.role() = 'authenticated');

drop policy if exists "Atestados visíveis por autenticados" on public.certificates;
drop policy if exists "Usuários autenticados gerenciam atestados" on public.certificates;

create policy "Atestados visíveis por autenticados" on public.certificates for select using (auth.role() = 'authenticated');
create policy "Usuários autenticados gerenciam atestados" on public.certificates for all using (auth.role() = 'authenticated');

drop policy if exists "Notificações visíveis por autenticados" on public.notifications;
drop policy if exists "Usuários autenticados gerenciam notificações" on public.notifications;

create policy "Notificações visíveis por autenticados" on public.notifications for select using (auth.role() = 'authenticated');
create policy "Usuários autenticados gerenciam notificações" on public.notifications for all using (auth.role() = 'authenticated');

drop policy if exists "Permutas visíveis por autenticados" on public.class_swaps;
drop policy if exists "Usuários autenticados gerenciam permutas" on public.class_swaps;

create policy "Permutas visíveis por autenticados" on public.class_swaps for select using (auth.role() = 'authenticated');
create policy "Usuários autenticados gerenciam permutas" on public.class_swaps for all using (auth.role() = 'authenticated');

-- 10. Trigger de Cadastro Automático de Profile e Role no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role text;
  v_name text;
  v_subject text;
begin
  v_name := coalesce(
    new.raw_user_meta_data->>'display_name', 
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  v_role := coalesce(
    new.raw_user_meta_data->>'role',
    case when new.email ilike '%admin%' or new.email ilike '%diretor%' or new.email ilike '%coordenador%' then 'admin' else 'teacher' end
  );

  v_subject := new.raw_user_meta_data->>'subject';

  insert into public.profiles (id, email, display_name, subject)
  values (new.id, new.email, v_name, v_subject)
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    subject = coalesce(excluded.subject, public.profiles.subject);

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Configurações de Sincronização & Rede</h3>
              <p className="text-xs text-slate-500 font-medium">Conecte o servidor da escola para sincronização em tempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl my-4">
          <button 
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'credentials' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Key size={14} />
            Credenciais de Sincronização
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'sql' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Terminal size={14} />
            Estrutura de Tabelas (Opcional)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'credentials' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Globe size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 leading-relaxed font-medium">
                    Instruções para conexão da escola:
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-blue-800">
                      <li><strong>Endereço do Servidor:</strong> <code className="bg-white/80 px-1 py-0.5 rounded text-blue-950 font-bold font-mono">https://[codigo-escola].supabase.co</code></li>
                      <li><strong>Chave de Acesso:</strong> Chave de sincronização pública institucional.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Endereço do Servidor em Nuvem (URL)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="https://sua-escola.supabase.co"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
                {autoFixed && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <Sparkles size={14} /> Endereço formatado e validado com sucesso!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chave de Acesso Institucional (Chave Pública)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Chave de sincronização institucional..."
                    value={key}
                    onChange={(e) => { setKey(e.target.value); setTestResult(null); }}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? <Check size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                  {testing ? 'Testando...' : 'Testar Conexão'}
                </button>

                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Check size={18} />
                  Salvar e Conectar
                </button>
              </div>

              {current.isConfigured && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Limpar credenciais salvas
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Estrutura de dados das tabelas escolares com proteção institucional:
                </p>
                <button 
                  onClick={copySql}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all shrink-0 border border-blue-200 cursor-pointer"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedSql ? 'Copiado com Sucesso!' : 'Copiar SQL Completo'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                <pre>{sqlSchema}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

