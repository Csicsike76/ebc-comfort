// Supabase client factory — service-role (server-side trusted) and user-scoped

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

/** Service-role client — bypasses RLS. Use only for trusted server-side operations. */
export function getServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** User-scoped client — respects RLS based on the JWT in the request. */
export function getUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve user id from the request JWT, or null if unauthenticated. */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const client = getUserClient(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}
