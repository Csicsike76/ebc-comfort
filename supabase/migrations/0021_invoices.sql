-- 0021_invoices.sql — accounting / invoicing foundation (provider-agnostic).
--
-- Activation needs BOTH a billing-provider key (e.g. SZAMLAZZHU_AGENT_KEY) AND a
-- registered legal entity (Kft + ÁFA-szám) — a Hungarian invoice is invalid
-- without them. This table + the lib/billing adapter are the FOUNDATION: an
-- invoice row can be recorded in 'blocked' state before a provider is configured,
-- so the flow is wired end-to-end and only the final issue step waits on keys.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  invoice_number text,                       -- provider-assigned; null until issued
  provider text not null default 'none',     -- 'szamlazzhu' | 'billingo' | 'none'
  external_id text,                          -- provider invoice id / token
  status text not null default 'draft'
    check (status in ('draft','blocked','issued','failed','storno')),
  reason text,                               -- why blocked / failed
  net_cents int not null default 0,
  vat_cents int not null default 0,
  gross_cents int not null default 0,
  currency text not null default 'EUR',
  buyer_name text,
  buyer_address jsonb,
  buyer_tax_id text,
  pdf_url text,
  issued_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now() not null
);

create index if not exists invoices_order_idx on public.invoices (order_id, created_at desc);
create index if not exists invoices_status_idx on public.invoices (status, created_at desc);

alter table public.invoices enable row level security;

-- Admin/super_admin only (uses the helper from 0002_profiles_roles.sql).
create policy "invoices_admin_all" on public.invoices
  for all
  using (public.user_has_role(auth.uid(), 'admin', 'super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin', 'super_admin'));
