import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

interface IdeasRequest {
  count?: number;
  channel?: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'mixed';
  notify_telegram?: boolean;
}

/**
 * POST /api/marketing/ideas
 * Admin-only. Generates 3 daily content ideas via Claude Haiku.
 * Optionally sends Telegram notification to admin chat.
 */
export async function POST(req: Request) {
  const userClient = await getSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: roles } = await userClient.from('user_roles').select('role').eq('user_id', user.id);
  const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
  if (!(roleSet.has('admin') || roleSet.has('super_admin'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: IdeasRequest = await req.json().catch(() => ({}));
  const count = Math.min(10, Math.max(1, body.count ?? 3));
  const channel = body.channel ?? 'mixed';
  const notifyTelegram = body.notify_telegram !== false;

  const prompt = `Generálj ${count} db rövid, friss tartalom-ötletet az EBC Comfort wellness-brand marketingjéhez. ${
    channel === 'mixed'
      ? 'Vegyes csatorna (Instagram Reels, TikTok, YouTube Shorts, Facebook).'
      : `Csatorna: ${channel}.`
  }

EBC Comfort: fűthető komfortbetét, 5 hőfokozat (50-70°C), 8000 mAh akku, USB-C, €100. WELLNESS (NEM orvosi).

TILTOTT: UTI, E. coli, antibiotikum, gyógyítás, kezelés. Csak: hőterápia, komfort, alhasi melegítés.

Formátum (JSON tömb, JSON-on kívül semmi!):
[{"channel":"...","hook":"első 3 másodperc","caption":"180-220 karakter","cta":"...","hashtags":["...","..."],"visual":"..."}]`;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat-completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      message: prompt,
      locale: 'hu',
      raw_mode: true,
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `AI call failed: ${res.status}` },
      { status: 500 }
    );
  }

  const data = (await res.json()) as { message?: string; content?: string; reply?: string };
  const text = data.message ?? data.content ?? data.reply ?? '';

  let ideas: Record<string, unknown>[] = [];
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      ideas = JSON.parse(jsonMatch[0]);
    } catch {
      // fall through — raw text returned
    }
  }

  // Persist as audit_log + send Telegram
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'admin_action',
      resource_type: 'marketing_ideas',
      resource_id: null,
      payload_after: { channel, count, ideas, raw_text: text.slice(0, 4000) },
      reason: 'Marketing ideas generation via Claude Haiku',
    });
  }

  let telegramSent = false;
  if (notifyTelegram && TELEGRAM_TOKEN && TELEGRAM_CHAT_ID && !TELEGRAM_TOKEN.includes('PLACEHOLDER')) {
    const lines = ideas.length
      ? ideas
          .map(
            (idea, i) =>
              `*${i + 1}. ${idea.channel ?? 'mixed'}*\n🎬 ${idea.hook ?? '—'}\n📝 ${idea.caption ?? '—'}\n👉 ${idea.cta ?? '—'}\n🏷️ ${Array.isArray(idea.hashtags) ? idea.hashtags.join(' ') : ''}`
          )
          .join('\n\n')
      : text.slice(0, 3500);
    const msg = `🎯 EBC Comfort — Tartalom-ötlet${count > 1 ? `ek (${count})` : ''}\n\n${lines}`;
    try {
      const tr = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
          parse_mode: 'Markdown',
        }),
      });
      telegramSent = tr.ok;
    } catch {
      telegramSent = false;
    }
  }

  return NextResponse.json({
    ok: true,
    count: ideas.length || (text ? 1 : 0),
    ideas,
    raw_text: ideas.length ? undefined : text,
    telegram_sent: telegramSent,
  });
}
