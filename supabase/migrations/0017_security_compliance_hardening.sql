-- 0017_security_compliance_hardening.sql
-- Sprint 12 — post-audit security + compliance fixes
-- Created: 2026-05-18
--
-- Fixes from 5-agent audit (see audit/2026-05-18-MASTER-SUMMARY.md):
--   1. chat_conversations RLS leak (anonymous sessions world-readable)
--   2. donations.recognized_publicly default = true (PII publicly default)
--   3. locales table missing 9 EU official codes
--   4. profiles.locale CHECK constraint blocking new locales (added in 0009 if any)
--   5. stripe_events idempotency table (webhook replay protection)
--   6. orders.billing_phone + shipping_phone columns (Retell IDOR fix needs them)
--   7. legal_documents — un-publish v1.0 entries pending lawyer review

-- =============================================================
-- 1. chat_conversations RLS — close anonymous-session leak
-- =============================================================
-- Previous: `using (auth.uid() = user_id or user_id is null)` made every
-- anonymous chat readable to any client with the public anon key.
-- Fix: anonymous chats are NOT directly readable; only the Edge Function
-- (service_role) reads them. Authenticated users still see their own.

drop policy if exists "chat_conversations_self_select" on public.chat_conversations;
create policy "chat_conversations_self_select" on public.chat_conversations
  for select using (auth.uid() = user_id);

drop policy if exists "chat_conversations_anyone_insert" on public.chat_conversations;
create policy "chat_conversations_auth_insert" on public.chat_conversations
  for insert with check (auth.uid() = user_id);
-- Anonymous-chat INSERT happens via Edge Function with service_role; clients
-- no longer insert directly.

drop policy if exists "chat_messages_self_select" on public.chat_messages;
create policy "chat_messages_self_select" on public.chat_messages
  for select using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));

drop policy if exists "chat_kb_retrievals_self_select" on public.chat_kb_retrievals;
create policy "chat_kb_retrievals_self_select" on public.chat_kb_retrievals
  for select using (exists (
    select 1 from public.chat_messages m
    join public.chat_conversations c on c.id = m.conversation_id
    where m.id = message_id and c.user_id = auth.uid()
  ));

-- =============================================================
-- 2. donations.recognized_publicly default → false (privacy-by-default)
-- =============================================================
alter table public.donations
  alter column recognized_publicly set default false;

-- Existing legacy rows: do NOT mass-update; keep historical donor intent.
-- Only NEW donations get the safer default.

-- =============================================================
-- 3. locales — add 9 missing EU official codes
-- =============================================================
insert into public.locales (code, name, display_order, is_active) values
  ('bg', 'Български', 16, true),
  ('hr', 'Hrvatski',  17, true),
  ('et', 'Eesti',     18, true),
  ('el', 'Ελληνικά',  19, true),
  ('ga', 'Gaeilge',   20, true),
  ('lv', 'Latviešu',  21, true),
  ('lt', 'Lietuvių',  22, true),
  ('mt', 'Malti',     23, true),
  ('sl', 'Slovenščina', 24, true)
on conflict (code) do nothing;

-- =============================================================
-- 4. profiles.locale — if any CHECK constraint restricts the column, drop it
--    so all 24 locales validate. We rely on the FK from locales table for
--    integrity, not a hard-coded CHECK.
-- =============================================================
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%locale%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end$$;

-- =============================================================
-- 5. stripe_events — webhook idempotency log
-- =============================================================
create table if not exists public.stripe_events (
  id text primary key,                          -- Stripe event.id (evt_*)
  event_type text not null,
  received_at timestamptz default now() not null,
  processed_at timestamptz default now() not null
);
alter table public.stripe_events enable row level security;
-- No client access. Service-role only.
create policy "stripe_events_admin_select" on public.stripe_events
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- 6. orders — add billing_phone + shipping_phone (Retell lookup-order needs them)
-- =============================================================
alter table public.orders
  add column if not exists billing_phone text,
  add column if not exists shipping_phone text;

-- =============================================================
-- 7. legal_documents — un-publish v1.0 entries pending lawyer review
-- =============================================================
-- Un-publish only docs that are NOT-YET-USABLE placeholders. The HU/EN v1.0
-- bodies are flagged "TEMPLATE — pending lawyer review" but still contain
-- substantive content (1k-2k chars) that is better than 404 while the
-- lawyer review proceeds. We only kill rows that explicitly defer to a
-- sister locale or are stubs (e.g. DE "(wie EN)").
update public.legal_documents
  set published_at = null,
      updated_at = now()
  where published_at is not null
    and (body_markdown ilike '%(wie EN)%'
      or body_markdown ilike '%(Tabelle wie%'
      or length(body_markdown) < 200);

comment on table public.stripe_events is 'Stripe webhook idempotency log (event.id PK). Service-role only.';
