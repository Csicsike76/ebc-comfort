-- 0024_email_locale.sql
-- Store the customer's locale on orders + support_requests so transactional
-- emails sent LATER (shipping update, NPS, support reply) go out in the
-- language the customer used at checkout / on the support form. Default 'hu'
-- backfills existing rows; new rows set the real locale in the API routes.
-- Created: 2026-06-26

alter table public.orders add column if not exists locale text not null default 'hu';
alter table public.support_requests add column if not exists locale text not null default 'hu';
