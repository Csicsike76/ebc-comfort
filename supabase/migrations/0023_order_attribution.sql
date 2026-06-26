-- 0023_order_attribution.sql
-- F2 ROAS foundation: persist campaign attribution onto orders so revenue can
-- be tied back to marketing_campaigns.utm_campaign (spend vs revenue = ROAS).
-- The utm value is captured client-side in the `ebc_utm` cookie (marketing
-- consent-gated, see UtmTracker.tsx) and written at checkout. Nullable +
-- untrusted text → length is capped in the checkout route.
-- Created: 2026-06-26

alter table public.orders add column if not exists utm_campaign text;
alter table public.orders add column if not exists utm_source text;

-- Partial index: ROAS only ever joins rows that actually carry a campaign.
create index if not exists orders_utm_campaign_idx
  on public.orders (utm_campaign)
  where utm_campaign is not null;
