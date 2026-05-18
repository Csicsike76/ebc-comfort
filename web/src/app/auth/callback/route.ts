import { NextRequest, NextResponse } from 'next/server';
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

  // Build redirect target explicitly so Next.js / Netlify does NOT preserve
  // the original `?next=...` query (which would echo an attacker-controlled
  // value back into the Location header even though the path itself is
  // already sanitized).
  const target = new URL(next, reqUrl.origin);
  target.search = '';
  return NextResponse.redirect(target);
}
