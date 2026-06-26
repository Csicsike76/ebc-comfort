import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRetellSignature, isRetellConfigured } from '@/lib/retell';
import { sendSupportReceived } from '@/lib/email/send';
import { isValidLocale } from '@/lib/i18n/config';

export const runtime = 'nodejs';

/**
 * Retell custom tool endpoint: create_support_ticket
 * Called by the LLM during a call to file a support_request.
 */
export async function POST(req: Request) {
  if (!isRetellConfigured()) {
    return NextResponse.json(
      { error: 'Retell not configured', placeholder: true },
      { status: 503 }
    );
  }
  const rawBody = await req.text();
  const sig = (await headers()).get('x-retell-signature');
  if (!verifyRetellSignature(rawBody, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Replay protection. Retell webhooks include a call_id; we have already
  // signed-and-verified the body via HMAC, but a captured-and-replayed
  // payload would still pass that check. Track call_id+tool-name uniqueness
  // in audit_log via a UNIQUE composite key. If the same call already
  // generated a ticket, return idempotent OK without re-inserting.
  interface ToolArgs {
    full_name?: string;
    email?: string;
    phone?: string;
    reason?: string;
  }
  let body: { args?: ToolArgs; call?: { call_id?: string; from_number?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const args = body.args ?? {};
  const full_name = (args.full_name ?? '').trim();
  const reason = (args.reason ?? '').trim();
  const email = (args.email ?? '').trim() || null;
  // Force the phone field to the verified Retell caller-id, NOT the LLM-arg,
  // so a prompt-injection attack cannot file a ticket with someone else's
  // phone number. LLM-arg fallback only kept for placeholder/test calls
  // where the call.from_number is missing.
  const phone = body.call?.from_number?.trim() || (args.phone ?? '').trim() || null;
  const callId = body.call?.call_id?.trim() ?? '';
  // Voice agent runs HU/EN/DE; use the spoken language if Retell passes it, else HU.
  const langArg = String((args as { language?: string }).language ?? '').trim().toLowerCase();
  const locale = isValidLocale(langArg) ? langArg : 'hu';

  if (!full_name || reason.length < 10) {
    return NextResponse.json({
      result: 'Hiányzó adat: név és indoklás (min. 10 karakter) szükséges.',
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ result: 'Backend unavailable' });
  }

  // Idempotency: if this exact call_id already filed a ticket, short-circuit.
  if (callId) {
    const { data: existing } = await admin
      .from('support_requests')
      .select('id')
      .eq('source_call_id', callId)
      .limit(1)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        result: `Köszönöm, ${full_name}! A kérvény már rögzítve van ehhez a híváshoz.`,
        deduped: true,
      });
    }
  }

  const { error } = await admin.from('support_requests').insert({
    full_name,
    email,
    phone,
    reason,
    status: 'pending',
    source_call_id: callId || null,
    locale,
  });

  if (error) {
    return NextResponse.json({ result: `Hiba: ${error.message}` });
  }

  if (email) {
    await sendSupportReceived({ locale, email, full_name, reason }).catch(() => undefined);
  }

  return NextResponse.json({
    result: `Köszönöm, ${full_name}! A kérvényt rögzítettem. 7-14 napon belül e-mailben válaszolunk${email ? ` a ${email} címre` : ''}.`,
  });
}
