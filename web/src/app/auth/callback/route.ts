import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeNext, htmlEscape } from '@/lib/auth-safe';

export async function GET(req: NextRequest) {
  const reqUrl = new URL(req.url);
  const code = reqUrl.searchParams.get('code');
  const next = sanitizeNext(reqUrl.searchParams.get('next'));

  if (code) {
    const supa = await getSupabaseServerClient();
    await supa.auth.exchangeCodeForSession(code);
  }

  // Defense in depth: `next` is already restricted to a strict path-whitelist
  // (SAFE_PATH_RE) so cannot contain quotes/angle brackets. We still HTML-escape
  // every interpolation site so any future relaxation of the sanitizer does
  // NOT silently introduce XSS.
  const target = `${reqUrl.origin}${next}`;
  const targetAttr = htmlEscape(target);
  const targetJson = JSON.stringify(target); // JS-safe — escapes quotes and slashes

  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${targetAttr}">
<meta name="robots" content="noindex,nofollow">
<title>Redirecting…</title>
</head><body>
<script>window.location.replace(${targetJson});</script>
<noscript><a href="${targetAttr}">Continue →</a></noscript>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
