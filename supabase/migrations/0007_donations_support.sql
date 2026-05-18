-- 0007_donations_support.sql
-- NGO támogatás-program: donations + support_requests + grants
-- Created: 2026-05-18

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.profiles(id) on delete set null,
  amount_cents int not null check (amount_cents > 0),
  currency text default 'EUR',
  payment_id uuid references public.payments(id) on delete set null,
  message text,
  is_anonymous boolean default false,
  recognized_publicly boolean default true,
  created_at timestamptz default now() not null
);

create index if not exists donations_created_idx
  on public.donations (created_at desc);
create index if not exists donations_donor_idx
  on public.donations (donor_id);

do $$ begin
  create type public.support_status as enum (
    'pending','approved','rejected','fulfilled','expired'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  reason text not null,
  income_proof_url text,
  status public.support_status default 'pending' not null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now() not null
);

create index if not exists support_requests_status_idx
  on public.support_requests (status, created_at desc);

create table if not exists public.support_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.support_requests(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  grant_value_cents int,
  fulfilled_at timestamptz,
  fulfilled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  locale text default 'hu',
  topics text[] default array['general'],
  subscribed_at timestamptz default now() not null,
  unsubscribed_at timestamptz
);

create index if not exists newsletter_subscriptions_active_idx
  on public.newsletter_subscriptions (locale, subscribed_at desc)
  where unsubscribed_at is null;
