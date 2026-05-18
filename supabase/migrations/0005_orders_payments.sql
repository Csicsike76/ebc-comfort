-- 0005_orders_payments.sql
-- Orders + line items + payments + shipments + returns + warranty
-- Created: 2026-05-18

do $$ begin
  create type public.order_status as enum (
    'pending','paid','preparing','shipped','delivered',
    'returned','cancelled','refunded'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status default 'pending' not null,
  currency text default 'EUR' not null,
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int default 0 check (shipping_cents >= 0),
  vat_cents int not null check (vat_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  shipping_address jsonb not null,
  billing_address jsonb,
  shipping_method text,
  notes text,
  tracking_number text,
  tracking_url text,
  created_at timestamptz default now() not null,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz
);

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx
  on public.orders (status) where status in ('pending','paid','preparing');
create index if not exists orders_number_idx on public.orders (order_number);

-- Auto-generate order_number: EBC-YYYYMM-XXXX
create sequence if not exists public.order_number_seq start 1 increment 1;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'EBC-' || to_char(now(), 'YYYYMM') || '-' ||
                         lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_number on public.orders;
create trigger orders_set_number
  before insert on public.orders
  for each row execute function public.set_order_number();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents > 0),
  vat_rate_pct numeric(5,2),
  line_total_cents int not null check (line_total_cents >= 0),
  created_at timestamptz default now() not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

do $$ begin
  create type public.payment_provider as enum (
    'stripe','simplepay','klarna','manual','sepa'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending','success','failed','refunded','partially_refunded'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider public.payment_provider not null,
  provider_transaction_id text,
  amount_cents int not null,
  currency text default 'EUR',
  status public.payment_status default 'pending' not null,
  metadata jsonb,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

create index if not exists payments_order_idx on public.payments (order_id);
create index if not exists payments_provider_tx_idx
  on public.payments (provider, provider_transaction_id);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  carrier text not null,                  -- 'GLS','DPD','POSTA','SPRINTER'
  tracking_number text,
  shipped_at timestamptz,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  status text,
  raw_status_payload jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists shipments_order_idx on public.shipments (order_id);
drop trigger if exists shipments_touch_updated_at on public.shipments;
create trigger shipments_touch_updated_at
  before update on public.shipments
  for each row execute function public.touch_updated_at();

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  reason text,
  return_label_url text,
  status text default 'requested'
    check (status in ('requested','approved','received','refunded','rejected')),
  refund_cents int,
  created_at timestamptz default now() not null,
  refunded_at timestamptz
);

create table if not exists public.warranty_claims (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  serial_number text,
  problem_description text,
  status text default 'open'
    check (status in ('open','investigating','resolved','rejected')),
  resolution text,
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);
