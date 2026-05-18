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

  // The Netlify Next.js plugin merges the request's query string into the
  // redirect Location, so /auth/callback?next=https://evil keeps echoing
  // evil.example back even though our handler returns a bare URL. To stop
  // that, we render a tiny HTML page that does a client-side <meta refresh>
  // + a <script> redirect to the sanitized target. The Location header is
  // gone entirely; nothing can inject query into a header that does not exist.
  const target = `${reqUrl.origin}${next}`;
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<title>Redirecting…</title>
</head><body>
<script>window.location.replace(${JSON.stringify(target)});</script>
<p>Redirecting to <a href="${target}">${target}</a>…</p>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
