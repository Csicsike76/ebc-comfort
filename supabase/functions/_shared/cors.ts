// Shared CORS headers for all Edge Functions
// Restricted to known EBC origins (production + Netlify deploy previews + localhost)
// Previously `*` — flagged by security audit as an unnecessary cross-origin window
// for any browser to call the GDPR / chat / Retell endpoints.

const ALLOWED_ORIGINS = [
  'https://ebc-comfort.netlify.app',
  'https://ebccomfort.hu',
  'https://www.ebccomfort.hu',
  'https://ebccomfort.eu',
  'http://localhost:3000',
  'http://localhost:3001',
];

const ALLOWED_ORIGIN_REGEX = /^https:\/\/[a-z0-9-]+--ebc-comfort\.netlify\.app$/;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return ALLOWED_ORIGIN_REGEX.test(origin);
}

function buildHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : 'https://ebc-comfort.netlify.app',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-internal-secret',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildHeaders(req) });
  }
  return null;
}

export function jsonResponse(data: unknown, status = 200, req?: Request): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (req) Object.assign(headers, buildHeaders(req));
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(message: string, status = 400, details?: unknown, req?: Request): Response {
  return jsonResponse({ error: message, details }, status, req);
}

/** Back-compat export; consumers reference `corsHeaders` for non-OPTIONS responses. */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://ebc-comfort.netlify.app',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-internal-secret',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Vary': 'Origin',
};
