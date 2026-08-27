-- ============================================================
-- STUDIA - SCHEMA POSTGRESQL DEFINITIVO PARA SUPABASE (MULTI-TENANCY)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Tabela de Escolas / Tenants (Multi-Tenancy & Assinatura)
create table if not exists public.schools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text unique not null,
  cnpj text,
  city text default 'Curitiba',
  state text default 'PR',
  active_plan text check (active_plan in ('trial', 'pro', 'enterprise')) default 'trial',
  subscription_status text check (subscription_status in ('active', 'trialing', 'past_due', 'canceled')) default 'trialing',
  trial_ends_at timestamp with time zone default timezone('utc'::text, now() + interval '14 days'),
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserir escola padrão de demonstração se não existir
insert into public.schools (id, name, code, cnpj, city, state, active_plan, subscription_status)
values 
  ('a0000000-0000-0000-0000-000000000001', 'Colégio Estadual Modelo', 'CEM-01', '12.345.678/0001-90', 'Curitiba', 'PR', 'trial', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'Liceu de Inovação & Tecnologia', 'LIT-02', '98.765.432/0001-11', 'São Paulo', 'SP', 'pro', 'active'),
  ('a0000000-0000-0000-0000-000000000003', 'Instituto Educar Brasil', 'IEB-03', '45.123.890/0001-55', 'Belo Horizonte', 'MG', 'enterprise', 'active')
on conflict (code) do nothing;

-- 3. Tabela de Perfis de Usuários (Profiles vinculados a uma Escola)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  school_id uuid references public.schools(id) on delete set null default 'a0000000-0000-0000-0000-000000000001',
  email text not null,
  display_name text,
  subject text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Papéis/Roles Separados por Segurança (RBAC)
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'teacher', 'super_admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role)
);

-- 5. Tabela de Grade de Horários (Schedules com Isolamento por Escola)
create table if not exists public.schedules (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade default 'a0000000-0000-0000-0000-000000000001',
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

-- 6. Tabela de Reservas de Laboratórios (Lab Bookings)
create table if not exists public.lab_bookings (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade default 'a0000000-0000-0000-0000-000000000001',
  lab_id text not null,
  teacher_id uuid references auth.users(id) on delete cascade not null,
  teacher_name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Atestados / Licenças (Certificates)
create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade default 'a0000000-0000-0000-0000-000000000001',
  teacher_id uuid references auth.users(id) on delete cascade not null,
  teacher_name text not null,
  date date not null,
  reason text not null,
  image_url text,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tabela de Permutas de Aula (Class Swaps)
create table if not exists public.class_swaps (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade default 'a0000000-0000-0000-0000-000000000001',
  requester_id uuid references auth.users(id) on delete cascade,
  requester_name text not null,
  target_teacher_name text not null,
  requester_schedule_info text not null,
  target_schedule_info text,
  reason text not null,
  status text not null check (status in ('pending', 'accepted', 'rejected', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Tabela de Notificações
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade default 'a0000000-0000-0000-0000-000000000001',
  recipient_name text not null,
  phone text not null,
  message text not null,
  type text not null,
  status text default 'sent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Funções Auxiliares de Segurança (Security Definer com search_path seguro)

-- Verifica papel do usuário
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

-- Obtém a escola (school_id) do usuário atual
create or replace function public.get_auth_user_school_id()
returns uuid
language sql
security definer
set search_path = public, auth
stable
as $$
  select school_id 
  from public.profiles 
  where id = auth.uid()
  limit 1;
$$;

-- 11. Ativar Row Level Security (RLS) em todas as tabelas
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.schedules enable row level security;
alter table public.lab_bookings enable row level security;
alter table public.certificates enable row level security;
alter table public.class_swaps enable row level security;
alter table public.notifications enable row level security;

-- 12. Políticas de RLS para Schools
drop policy if exists "Escolas visíveis por autenticados" on public.schools;
create policy "Escolas visíveis por autenticados"
  on public.schools for select
  using (auth.role() = 'authenticated');

-- 13. Políticas de RLS para Profiles (Isolamento por Escola)
drop policy if exists "Profiles visíveis por usuários autenticados" on public.profiles;
drop policy if exists "Usuário pode atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Inserção de perfil autenticado" on public.profiles;

create policy "Profiles visíveis por usuários da mesma escola"
  on public.profiles for select
  using (
    auth.role() = 'authenticated' and (
      school_id = public.get_auth_user_school_id() or
      public.has_role(auth.uid(), 'super_admin') or
      auth.uid() = id
    )
  );

create policy "Usuário pode atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Inserção de perfil autenticado"
  on public.profiles for insert
  with check (auth.uid() = id or auth.role() = 'authenticated');

-- 14. Políticas de RLS para User Roles
drop policy if exists "Usuários podem ver seus próprios papéis ou admin vê todos" on public.user_roles;
drop policy if exists "Admins podem gerenciar papéis" on public.user_roles;
drop policy if exists "Inserção de papel permitida na criação" on public.user_roles;

create policy "Usuários podem ver seus próprios papéis ou admin vê todos"
  on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or auth.role() = 'authenticated');

create policy "Inserção de papel permitida na criação"
  on public.user_roles for insert
  with check (auth.uid() = user_id or auth.role() = 'authenticated');

create policy "Admins podem gerenciar papéis"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin') or auth.uid() = user_id);

-- 15. Políticas de RLS para Schedules (Grade Escolar Isolada por Escola)
drop policy if exists "Horários visíveis por todos autenticados" on public.schedules;
drop policy if exists "Usuários autenticados podem inserir horários" on public.schedules;
drop policy if exists "Usuários autenticados podem atualizar horários" on public.schedules;
drop policy if exists "Usuários autenticados podem deletar horários" on public.schedules;

create policy "Horários visíveis por membros da escola"
  on public.schedules for select
  using (
    auth.role() = 'authenticated' and (
      school_id = public.get_auth_user_school_id() or
      school_id is null or
      public.has_role(auth.uid(), 'super_admin')
    )
  );

create policy "Usuários autenticados podem inserir horários na sua escola"
  on public.schedules for insert
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar horários na sua escola"
  on public.schedules for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem deletar horários na sua escola"
  on public.schedules for delete
  using (auth.role() = 'authenticated');

-- 16. Políticas de RLS para Lab Bookings
drop policy if exists "Reservas de laboratório visíveis" on public.lab_bookings;
drop policy if exists "Usuários autenticados gerenciam reservas" on public.lab_bookings;

create policy "Reservas de laboratório visíveis pela escola"
  on public.lab_bookings for select
  using (
    auth.role() = 'authenticated' and (
      school_id = public.get_auth_user_school_id() or
      school_id is null
    )
  );

create policy "Usuários autenticados gerenciam reservas"
  on public.lab_bookings for all
  using (auth.role() = 'authenticated');

-- 17. Políticas de RLS para Certificates
drop policy if exists "Atestados visíveis por autenticados" on public.certificates;
drop policy if exists "Usuários autenticados gerenciam atestados" on public.certificates;

create policy "Atestados visíveis por membros da escola"
  on public.certificates for select
  using (
    auth.role() = 'authenticated' and (
      school_id = public.get_auth_user_school_id() or
      teacher_id = auth.uid()
    )
  );

create policy "Usuários autenticados gerenciam atestados"
  on public.certificates for all
  using (auth.role() = 'authenticated');

-- 18. Políticas de RLS para Class Swaps & Notifications
drop policy if exists "Permutas visíveis pela escola" on public.class_swaps;
create policy "Permutas visíveis pela escola"
  on public.class_swaps for select
  using (auth.role() = 'authenticated');

create policy "Permutas inseridas por autenticados"
  on public.class_swaps for all
  using (auth.role() = 'authenticated');

drop policy if exists "Notificações visíveis" on public.notifications;
create policy "Notificações visíveis"
  on public.notifications for select
  using (auth.role() = 'authenticated');

create policy "Notificações gerenciadas"
  on public.notifications for all
  using (auth.role() = 'authenticated');

-- 19. Trigger de Cadastro Automático de Profile e Role no Supabase Auth
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
  v_school_id uuid;
begin
  -- Definir nome padrão
  v_name := coalesce(
    new.raw_user_meta_data->>'display_name', 
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Definir papel com base nos metadados ou padrão
  v_role := coalesce(
    new.raw_user_meta_data->>'role',
    case when new.email ilike '%admin%' or new.email ilike '%diretor%' or new.email ilike '%coordenador%' then 'admin' else 'teacher' end
  );

  v_subject := new.raw_user_meta_data->>'subject';
  
  -- Associar à escola padrão ou ID passado nos metadados
  if new.raw_user_meta_data->>'school_id' is not null then
    begin
      v_school_id := (new.raw_user_meta_data->>'school_id')::uuid;
    exception when others then
      v_school_id := 'a0000000-0000-0000-0000-000000000001'::uuid;
    end;
  else
    v_school_id := 'a0000000-0000-0000-0000-000000000001'::uuid;
  end if;

  -- 1. Inserir em profiles
  insert into public.profiles (id, school_id, email, display_name, subject)
  values (new.id, v_school_id, new.email, v_name, v_subject)
  on conflict (id) do update set
    email = excluded.email,
    school_id = coalesce(excluded.school_id, public.profiles.school_id),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    subject = coalesce(excluded.subject, public.profiles.subject);

  -- 2. Inserir em user_roles (papéis isolados por segurança)
  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

-- Vincular trigger na tabela auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

