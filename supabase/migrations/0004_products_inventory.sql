-- 0004_products_inventory.sql
-- Product catalog + multi-locale + inventory
-- Created: 2026-05-18

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique not null,
  status text default 'draft' check (status in ('draft','active','paused','archived')),
  base_price_cents int not null check (base_price_cents > 0),
  currency text default 'EUR' not null,
  vat_rate_pct numeric(5,2) default 27.00 not null,
  weight_grams int,
  dimensions_mm jsonb,
  warranty_months int default 12,
  hs_code text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists products_status_idx on public.products (status) where status = 'active';
create index if not exists products_sku_idx on public.products (sku);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

create table if not exists public.product_translations (
  product_id uuid references public.products(id) on delete cascade,
  locale text not null,
  name text not null,
  short_description text,
  long_description text,
  meta_title text,
  meta_description text,
  primary key (product_id, locale)
);

create index if not exists product_translations_locale_idx
  on public.product_translations (locale);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt_text jsonb,                              -- {"hu":"...","en":"..."}
  display_order int default 0,
  created_at timestamptz default now() not null
);

create index if not exists product_images_product_order_idx
  on public.product_images (product_id, display_order);

create table if not exists public.inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  stock_qty int not null default 0 check (stock_qty >= 0),
  reserved_qty int default 0 check (reserved_qty >= 0),
  low_stock_threshold int default 50,
  last_updated timestamptz default now() not null
);

comment on table public.inventory is 'Stock per product. reserved_qty = in flight orders, stock_qty = on-hand. Available = stock_qty - reserved_qty.';

create or replace function public.inventory_available(p_product_id uuid)
returns int
language sql
stable
as $$
  select greatest(0, coalesce(stock_qty,0) - coalesce(reserved_qty,0))
  from public.inventory where product_id = p_product_id;
$$;
