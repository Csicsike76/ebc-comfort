-- 0019_chat_rate_limit.sql
-- Cost-DoS guard for the ai-chat-completion edge function: each request triggers a
-- paid Anthropic call, and the function is publicly reachable with the anon key, so an
-- attacker can loop it to burn budget. Fixed-window counter per bucket.
-- ponytail: fixed-window (not sliding) — a burst straddling a window boundary can briefly
-- hit ~2x the cap; upgrade to a sliding window only if that 2x matters. Fine as a budget
-- circuit-breaker. Created: 2026-06-24

create table if not exists public.rate_limit_buckets (
  bucket text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

-- Touched only by the edge function via the service client. Lock out the public API:
-- PostgREST otherwise exposes the table to anon/authenticated.
alter table public.rate_limit_buckets enable row level security;
revoke all on public.rate_limit_buckets from anon, authenticated;

-- Atomic check-and-increment. Returns true if the request is within the limit.
create or replace function public.check_rate_limit(
  p_bucket text,
  p_max int,
  p_window_secs int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limit_buckets as b (bucket, window_start, count)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update
    set count = case
                  when b.window_start < now() - make_interval(secs => p_window_secs)
                  then 1
                  else b.count + 1
                end,
        window_start = case
                  when b.window_start < now() - make_interval(secs => p_window_secs)
                  then now()
                  else b.window_start
                end
  returning b.count into v_count;
  return v_count <= p_max;
end;
$$;

-- PostgREST exposes public functions as RPC endpoints. The edge function calls this with
-- the service client (bypasses these grants); anon/authenticated must NOT call it directly.
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;

-- self-check: runs at migration apply, fails the deploy if the window logic breaks.
do $$
declare
  b text := 'selftest:' || gen_random_uuid()::text;
begin
  assert public.check_rate_limit(b, 3, 60) = true,  'req1 within limit';
  assert public.check_rate_limit(b, 3, 60) = true,  'req2 within limit';
  assert public.check_rate_limit(b, 3, 60) = true,  'req3 within limit';
  assert public.check_rate_limit(b, 3, 60) = false, 'req4 over limit -> blocked';
  delete from public.rate_limit_buckets where bucket = b;
end $$;
