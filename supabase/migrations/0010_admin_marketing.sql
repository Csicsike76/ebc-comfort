-- 0010_admin_marketing.sql
-- Marketing campaigns + email log + file uploads + NPS
-- Created: 2026-05-18

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text check (channel in (
    'facebook','instagram','tiktok','youtube','google_ads','email','influencer','press'
  )),
  budget_cents int,
  spent_cents int default 0,
  conversions int default 0,
  utm_campaign text,
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_at timestamptz default now() not null
);

create index if not exists marketing_campaigns_channel_idx
  on public.marketing_campaigns (channel, started_at desc);

create table if not exists public.email_sent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  template_key text,                            -- 'order_confirmation','shipping_update','nps_survey'
  to_email citext,
  subject text,
  body_html text,
  provider text default 'resend',
  provider_message_id text,
  status text default 'sent',
  created_at timestamptz default now() not null
);

create index if not exists email_sent_log_user_idx
  on public.email_sent_log (user_id, created_at desc);
create index if not exists email_sent_log_template_idx
  on public.email_sent_log (template_key, created_at desc);

create table if not exists public.file_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  bucket text not null,
  path text not null,
  size_bytes int,
  mime_type text,
  purpose text,                                 -- 'income_proof','avatar','article_image'
  created_at timestamptz default now() not null
);

create index if not exists file_uploads_user_purpose_idx
  on public.file_uploads (user_id, purpose, created_at desc);

-- NPS survey (post-purchase 30 days)
create table if not exists public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  score int check (score between 0 and 10),
  comment text,
  submitted_at timestamptz default now() not null
);

create index if not exists nps_responses_score_idx
  on public.nps_responses (score, submitted_at desc);
