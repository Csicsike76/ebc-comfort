-- 0014_legal_documents.sql
-- Versioned legal documents (ASZF, Privacy Policy, Cookie Notice, etc.)
-- with multi-locale + retire timestamps
-- Created: 2026-05-18

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,                       -- 'aszf' | 'adatvedelem' | 'cookie-tajekoztato' | 'impresszum'
  version text not null,                    -- 'v1.0' | 'v1.1' | etc
  locale text not null references public.locales(code) on delete cascade,
  title text not null,
  body_markdown text not null,
  published_at timestamptz,                 -- null = draft; non-null = currently or formerly published
  retired_at timestamptz,                   -- null = currently active; non-null = retired
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (slug, version, locale)
);

create index if not exists legal_documents_slug_locale_active_idx
  on public.legal_documents (slug, locale, published_at desc)
  where retired_at is null;

drop trigger if exists legal_documents_touch_updated_at on public.legal_documents;
create trigger legal_documents_touch_updated_at
  before update on public.legal_documents
  for each row execute function public.touch_updated_at();

alter table public.legal_documents enable row level security;

create policy "legal_documents_public_select_published" on public.legal_documents
  for select using (
    published_at is not null and retired_at is null
    or public.user_has_role(auth.uid(), 'admin','super_admin','editor')
  );

create policy "legal_documents_admin_all" on public.legal_documents
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

-- Helper: returns the currently-active body for a slug+locale (fallback to HU/EN if missing)
create or replace function public.get_active_legal(
  p_slug text,
  p_locale text
)
returns table (
  id uuid,
  slug text,
  version text,
  locale text,
  title text,
  body_markdown text,
  published_at timestamptz
)
language sql
stable
as $$
  select id, slug, version, locale, title, body_markdown, published_at
  from public.legal_documents
  where slug = p_slug
    and published_at is not null and retired_at is null
    and locale = p_locale
  order by published_at desc
  limit 1;
$$;

comment on table public.legal_documents is
  'Versioned legal documents (TOS, privacy, cookie notice, etc.). Per slug+locale, the latest non-retired published row is currently active. Older versions kept for GDPR audit trail.';
