-- ============================================================
-- Hirely - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  email text not null,
  cpf text,
  rg text,
  birth_date date,
  phone text,
  role text default 'candidate' check (role in ('candidate', 'admin')),
  onboarding_step text default 'schedule' check (
    onboarding_step in ('register', 'schedule', 'documents', 'complete')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clinic_name text not null,
  clinic_address text not null,
  clinic_phone text,
  clinic_email text,
  scheduled_date date not null,
  scheduled_time time not null,
  status text default 'pending' check (
    status in ('pending', 'confirmed', 'completed', 'cancelled')
  ),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Users can manage own appointments"
  on public.appointments for all
  using (auth.uid() = user_id);

create policy "Admins can view all appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (
    type in ('prontuario', 'guia_encaminhamento', 'aso', 'outros')
  ),
  file_name text not null,
  file_url text not null,
  file_size bigint not null,
  notes text,
  uploaded_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Users can manage own documents"
  on public.documents for all
  using (auth.uid() = user_id);

create policy "Admins can view all documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins can view all documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- UPDATE User Admin
-- ============================================================
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
