// Edge Function: telegram-admin-notify
// Sends a message to the EBC admin Telegram chat
// Auth: shared-secret header X-Internal-Secret (set via supabase secrets)
// For admin-user calls: pass valid JWT and admin role check

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getServiceClient, getUserIdFromRequest } from '../_shared/supabase-client.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_ADMIN_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');
const INTERNAL_SECRET = Deno.env.get('INTERNAL_NOTIFY_SECRET');

interface NotifyRequest {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

serve(async (req: Request) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    return errorResponse('Telegram bot not configured', 500);
  }

  // --- auth: shared-secret OR admin user JWT ---
  const headerSecret = req.headers.get('X-Internal-Secret') ?? '';
  const isInternal = INTERNAL_SECRET && headerSecret === INTERNAL_SECRET;

  if (!isInternal) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return errorResponse('Unauthorized', 401);

    const supa = getServiceClient();
    const { data: roles } = await supa
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const hasAdmin = (roles ?? []).some(
      (r: { role: string }) => r.role === 'admin' || r.role === 'super_admin'
    );
    if (!hasAdmin) return errorResponse('Forbidden — admin required', 403);
  }

  let body: NotifyRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const text = (body.text ?? '').trim();
  if (!text) return errorResponse('text is required', 400);
  if (text.length > 4096) return errorResponse('text too long (max 4096)', 400);

  const tgRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text,
        parse_mode: body.parse_mode ?? 'HTML',
        disable_web_page_preview: true,
      }),
    }
  );

  if (!tgRes.ok) {
    const detail = await tgRes.text();
    console.error('Telegram API error', tgRes.status, detail);
    return errorResponse('Telegram API error', 502, detail);
  }

  const result = await tgRes.json();
  return jsonResponse({ ok: true, message_id: result.result?.message_id });
});
