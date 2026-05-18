-- 0018_post_reaudit_fixes.sql
-- Sprint 14 — post-RE-audit fixes (CRIT XSS + Retell idempotency + legal-doc restore)
-- Created: 2026-05-18

-- =============================================================
-- 1. support_requests.source_call_id — Retell create-ticket idempotency
-- =============================================================
alter table public.support_requests
  add column if not exists source_call_id text;
create unique index if not exists support_requests_source_call_id_uidx
  on public.support_requests (source_call_id)
  where source_call_id is not null;

-- =============================================================
-- 2. Re-publish HU + EN legal docs that were over-aggressively un-published
--    by Mig 0017. The bodies are flagged TEMPLATE but contain substantive
--    content (1k-2k chars). Better than 404 while the lawyer review proceeds.
-- =============================================================
update public.legal_documents
  set published_at = '2026-05-18 12:00:00+00',
      updated_at = now()
  where version = 'v1.0'
    and locale in ('hu', 'en')
    and published_at is null
    and length(body_markdown) >= 200
    and not (body_markdown ilike '%(wie EN)%' or body_markdown ilike '%(Tabelle wie%');

-- =============================================================
-- 3. Note: Andrew's silicone-grade certification is still pending. Body
--    text remains marked TEMPLATE so the lawyer-review banner shows up.
-- =============================================================
