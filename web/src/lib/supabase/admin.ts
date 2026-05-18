import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only admin client using service_role key.
 * Bypasses RLS — use ONLY in server routes for actions that
 * legitimately need elevated access (guest orders, webhooks, etc.).
 * NEVER import in client components.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key.includes('PLACEHOLDER')) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
