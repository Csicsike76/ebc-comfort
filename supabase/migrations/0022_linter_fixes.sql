-- 0022_linter_fixes.sql — Supabase database-linter biztonsági javítások.
-- ÉLES PROD-ra alkalmazva + ellenőrizve 2026-06-26 (Management API). Ez a fájl a verziókövetés,
-- hogy egy újradeploy ne hozza vissza a figyelmeztetéseket.
--
-- 1) search_path rögzítése a flaggelt függvényeken (function_search_path_mutable).
-- 2) Belső SECURITY DEFINER trigger/log függvények RPC-kitettségének megszüntetése
--    (revoke EXECUTE FROM public, anon, authenticated). FONTOS: a `user_has_role` SZÁNDÉKOSAN
--    marad — az RLS-policy-k hívják, a revoke eltörné az admin-hozzáférést.

do $$ declare r record; begin
  for r in select p.oid::regprocedure::text sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in
      ('touch_updated_at','inventory_available','set_order_number','match_kb_chunks','get_active_legal')
  loop execute format('alter function %s set search_path = public', r.sig); end loop;
end $$;

do $$ declare r record; begin
  for r in select p.oid::regprocedure::text sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in
      ('auto_grant_super_admin','handle_new_user','log_audit','log_security_event')
  loop execute format('revoke execute on function %s from public, anon, authenticated', r.sig); end loop;
end $$;

-- NEM kódból javítható (manuális, dashboard):
--   • auth_leaked_password_protection (HaveIBeenPwned) — FIZETŐS Supabase-plan kell (free → 402).
--   • newsletter_subscriptions "anyone_subscribe" INSERT WITH CHECK(true) — SZÁNDÉKOS (bárki feliratkozhat).
