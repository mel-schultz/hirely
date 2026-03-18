-- ============================================================
-- Hirely - Schema Completo e Definitivo
-- Execute tudo de uma vez no SQL Editor do Supabase
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists public.profiles (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  full_name     text not null default '',
  email         text not null default '',
  cpf           text,
  rg            text,
  birth_date    date,
  phone         text,
  role          text default 'candidate'
                  check (role in ('candidate', 'admin', 'super_admin')),
  onboarding_step text default 'schedule'
                  check (onboarding_step in ('register', 'schedule', 'documents', 'complete')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.appointments (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  clinic_name     text not null,
  clinic_address  text not null,
  clinic_phone    text,
  clinic_email    text,
  scheduled_date  date not null,
  scheduled_time  time not null,
  status          text default 'pending'
                    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.documents (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null
                check (type in ('prontuario', 'guia_encaminhamento', 'aso', 'outros')),
  file_name   text not null,
  file_url    text not null,
  file_size   bigint not null,
  notes       text,
  uploaded_at timestamptz default now()
);

-- ============================================================
-- RLS — SEM SUBQUERIES (evita recursão infinita)
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.appointments enable row level security;
alter table public.documents   enable row level security;

-- PROFILES: cada usuário acessa apenas o próprio registro
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_delete" on public.profiles
  for delete using (auth.uid() = user_id);

-- APPOINTMENTS
create policy "appointments_select" on public.appointments
  for select using (auth.uid() = user_id);

create policy "appointments_insert" on public.appointments
  for insert with check (auth.uid() = user_id);

create policy "appointments_update" on public.appointments
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "appointments_delete" on public.appointments
  for delete using (auth.uid() = user_id);

-- DOCUMENTS
create policy "documents_select" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents_insert" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "documents_delete" on public.documents
  for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at    on public.profiles;
drop trigger if exists appointments_updated_at on public.appointments;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();

-- Auto-cria perfil ao cadastrar (super_admin para email fixo)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case
      when new.email = 'mel.schultz@yahoo.com' then 'super_admin'
      else 'candidate'
    end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INSERIR PERFIL PARA USUÁRIOS JÁ CADASTRADOS
-- (caso o trigger não tenha rodado antes)
-- ============================================================

insert into public.profiles (user_id, full_name, email, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  u.email,
  case
    when u.email = 'mel.schultz@yahoo.com' then 'super_admin'
    else 'candidate'
  end
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);

-- ============================================================
-- VERIFICAR RESULTADO
-- ============================================================

select email, role, created_at from public.profiles order by created_at;
