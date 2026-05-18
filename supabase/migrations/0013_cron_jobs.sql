-- 0013_cron_jobs.sql
-- pg_cron scheduled tasks
-- Note: pg_cron requires extension enabled in Supabase dashboard (Project Settings → Database → Extensions)
-- Created: 2026-05-18

-- Enable pg_cron extension if available (must be in extensions schema)
create extension if not exists pg_cron with schema extensions;

-- Grant usage to authenticated for SELECT only (job inspection)
grant usage on schema cron to postgres;

-- =============================================================
-- CLEANUP OLD ANONYMOUS CHAT SESSIONS (90+ days, no user_id)
-- =============================================================
select cron.schedule(
  'cleanup-old-chat-sessions',
  '0 3 * * 0',                   -- every Sunday 03:00 UTC
  $$
  delete from public.chat_conversations
  where ended_at < now() - interval '90 days'
    and user_id is null
  $$
);

-- =============================================================
-- AUDIT-LOG PII RETENTION: NULL out PII columns after 90 days
-- Mirrors SDGrillManager pattern
-- =============================================================
select cron.schedule(
  'audit-log-pii-retention',
  '15 3 * * 0',                  -- every Sunday 03:15 UTC
  $$
  update public.audit_log
  set ip_address = null,
      user_agent = null,
      payload_before = null,
      payload_after = null
  where created_at < now() - interval '90 days'
    and (ip_address is not null or user_agent is not null
         or payload_before is not null or payload_after is not null)
  $$
);

-- =============================================================
-- EXPIRE STALE SUPPORT REQUESTS (>180 days pending)
-- =============================================================
select cron.schedule(
  'support-requests-expire',
  '0 4 * * *',                   -- every day 04:00 UTC
  $$
  update public.support_requests
  set status = 'expired'
  where status = 'pending'
    and created_at < now() - interval '180 days'
  $$
);

-- =============================================================
-- NEWSLETTER: hard-delete unsubscribed after 1 year
-- =============================================================
select cron.schedule(
  'newsletter-purge-unsubscribed',
  '0 4 1 * *',                   -- 1st of month 04:00 UTC
  $$
  delete from public.newsletter_subscriptions
  where unsubscribed_at is not null
    and unsubscribed_at < now() - interval '1 year'
  $$
);

-- Note: shipping-status-poll + low-stock-alert + nps-survey-send
-- are HTTP-call cron jobs that fire Edge Functions. Will be added
-- in 0014 once Edge Function URLs are deployed.

-- View scheduled jobs (for verification):
-- select * from cron.job;
