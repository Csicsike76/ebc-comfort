import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeNext } from '@/lib/auth-safe';

export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const code = reqUrl.searchParams.get('code');
  const next = sanitizeNext(reqUrl.searchParams.get('next'));

  if (code) {
    const supa = await getSupabaseServerClient();
    await supa.auth.exchangeCodeForSession(code);
  }

  // Build the redirect target by hand so neither Next.js nor the Netlify
  // adapter can echo the original `?next=https://evil.example` query back
  // into the Location header (which would surface in security scanners
  // even though the path itself is already sanitized).
  const target = `${reqUrl.origin}${next}`;
  return new Response(null, {
    status: 307,
    headers: {
      Location: target,
      'Cache-Control': 'no-store',
    },
  });
}
