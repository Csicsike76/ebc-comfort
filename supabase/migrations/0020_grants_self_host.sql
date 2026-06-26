-- 0020_grants_self_host.sql
-- Self-host / on-prem parity.
--
-- Hosted Supabase auto-grants table/sequence/function privileges to the
-- anon / authenticated / service_role roles (row access is still enforced by
-- RLS). A self-hosted or on-prem Postgres does NOT do this automatically, so
-- every RLS-gated read fails with "42501 permission denied for table ..."
-- and the admin panel (which reads user_roles to check access) goes dark.
--
-- Grant the privileges explicitly and set default privileges so future
-- migrations stay covered. Row-level access remains enforced by the policies
-- in 0011_rls_policies.sql — these grants only open the table at the SQL-
-- privilege layer, exactly like the managed platform does.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
