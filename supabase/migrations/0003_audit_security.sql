-- 0003_audit_security.sql
-- Audit log + security events (RBAC-only access)
-- Mirrors Apaserv SSM audit pattern
-- Created: 2026-05-18

-- =============================================================
-- AUDIT LOG
-- =============================================================
do $$ begin
  create type public.audit_action as enum (
    'create','update','delete','read','export','login','logout','consent_change','admin_action'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.audit_log (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action public.audit_action not null,
  resource_type text not null,           -- 'order', 'product', 'donation', ...
  resource_id text,
  ip_address inet,
  user_agent text,
  payload_before jsonb,
  payload_after jsonb,
  reason text,                            -- admin-supplied note
  created_at timestamptz default now() not null
);

create index if not exists audit_log_user_idx
  on public.audit_log (user_id, created_at desc);
create index if not exists audit_log_resource_idx
  on public.audit_log (resource_type, resource_id, created_at desc);
create index if not exists audit_log_action_idx
  on public.audit_log (action, created_at desc);

comment on table public.audit_log is 'Append-only audit trail of CRUD actions. NEVER delete rows — only PII-redact via 90-day retention job.';

-- =============================================================
-- SECURITY EVENTS
-- =============================================================
do $$ begin
  create type public.security_event_type as enum (
    'failed_login','suspicious_activity','rate_limit_hit',
    'gdpr_export','gdpr_erasure','consent_change','admin_action',
    'api_key_rotation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.security_severity as enum ('info','warning','critical');
exception when duplicate_object then null; end $$;

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type public.security_event_type not null,
  severity public.security_severity default 'info' not null,
  description text,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create index if not exists security_events_user_idx
  on public.security_events (user_id, created_at desc);
create index if not exists security_events_type_severity_idx
  on public.security_events (event_type, severity, created_at desc);

-- =============================================================
-- HELPERS
-- =============================================================
-- Standard audit-insert function used by triggers + edge functions
create or replace function public.log_audit(
  p_action public.audit_action,
  p_resource_type text,
  p_resource_id text,
  p_payload_before jsonb default null,
  p_payload_after jsonb default null,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (user_id, action, resource_type, resource_id, payload_before, payload_after, reason)
  values (auth.uid(), p_action, p_resource_type, p_resource_id, p_payload_before, p_payload_after, p_reason);
end;
$$;

create or replace function public.log_security_event(
  p_event_type public.security_event_type,
  p_severity public.security_severity default 'info',
  p_description text default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.security_events (user_id, event_type, severity, description, metadata)
  values (auth.uid(), p_event_type, p_severity, p_description, p_metadata);
end;
$$;
