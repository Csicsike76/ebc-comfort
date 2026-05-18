-- 0002_profiles_roles.sql
-- User identity, profiles, RBAC roles, GDPR consent ledger
-- Built on supabase auth.users
-- Created: 2026-05-18

-- =============================================================
-- PROFILES
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text,
  phone text,
  avatar_url text,
  locale text default 'hu' check (locale in (
    'hu','en','de','fr','it','es','pl','ro','nl','pt','cs','sk','sv','da','fi'
  )),
  newsletter_opt_in boolean default false,
  marketing_opt_in boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_locale_idx on public.profiles (locale);

-- Trigger to auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =============================================================
-- RBAC: USER ROLES
-- =============================================================
do $$ begin
  create type public.user_role as enum (
    'super_admin',   -- Zsolt — full control
    'admin',         -- Operations + customer service
    'editor',        -- Education content writer (Ildi)
    'customer',      -- Default vásárló
    'supporter',     -- NGO supporter (donate, follow)
    'beneficiary'    -- Alacsony jövedelmű támogatott
  );
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  granted_at timestamptz default now() not null,
  granted_by uuid references public.profiles(id),
  primary key (user_id, role)
);

create index if not exists user_roles_role_idx on public.user_roles (role);

-- Helper: check if a given uid has any of the listed roles
create or replace function public.user_has_role(check_user_id uuid, variadic check_roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = check_user_id and role = any(check_roles)
  );
$$;

-- =============================================================
-- GDPR CONSENT LEDGER
-- =============================================================
do $$ begin
  create type public.consent_purpose as enum (
    'tos',                  -- ÁSZF elfogadás
    'privacy',              -- adatvédelmi tájékoztató
    'marketing_email',
    'marketing_sms',
    'cookies_analytics',
    'cookies_marketing',
    'ai_chat_recording',
    'phone_call_recording'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  purpose public.consent_purpose not null,
  granted boolean not null,
  granted_at timestamptz default now() not null,
  revoked_at timestamptz,
  ip_address inet,
  user_agent text,
  document_version text       -- e.g. 'tos-v1.2'
);

create index if not exists consents_user_purpose_idx
  on public.consents (user_id, purpose, granted_at desc);

comment on table public.consents is 'GDPR consent ledger — append-only audit trail of user consent grants/revocations';

-- Helper: latest consent state per purpose
create or replace view public.consents_latest as
select distinct on (user_id, purpose)
  user_id, purpose, granted, granted_at, document_version
from public.consents
order by user_id, purpose, granted_at desc;
