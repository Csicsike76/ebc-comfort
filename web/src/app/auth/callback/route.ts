import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const SAFE_DEFAULT = '/hu/admin';

function sanitizeNext(raw: string | null): string {
  if (!raw) return SAFE_DEFAULT;
  // Reject anything that isn't a same-origin path.
  // Disallow protocol-relative (//evil.com), absolute URLs, backslashes, and missing leading slash.
  if (!raw.startsWith('/')) return SAFE_DEFAULT;
  if (raw.startsWith('//')) return SAFE_DEFAULT;
  if (raw.startsWith('/\\')) return SAFE_DEFAULT;
  if (/^\/[^/]*:/.test(raw)) return SAFE_DEFAULT;
  // Strip any embedded protocol after decoding.
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.includes('://')) return SAFE_DEFAULT;
    if (decoded.startsWith('//')) return SAFE_DEFAULT;
  } catch {
    return SAFE_DEFAULT;
  }
  return raw;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));

  if (code) {
    const supa = await getSupabaseServerClient();
    await supa.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
