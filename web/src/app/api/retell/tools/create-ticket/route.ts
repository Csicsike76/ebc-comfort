import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRetellSignature, isRetellConfigured } from '@/lib/retell';
import { sendSupportReceived } from '@/lib/email/send';

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

  interface ToolArgs {
    full_name?: string;
    email?: string;
    phone?: string;
    reason?: string;
  }
  let body: { args?: ToolArgs };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const args = body.args ?? {};
  const full_name = (args.full_name ?? '').trim();
  const reason = (args.reason ?? '').trim();
  const email = (args.email ?? '').trim() || null;
  const phone = (args.phone ?? '').trim() || null;

  if (!full_name || reason.length < 10) {
    return NextResponse.json({
      result: 'Hiányzó adat: név és indoklás (min. 10 karakter) szükséges.',
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ result: 'Backend unavailable' });
  }

  const { error } = await admin.from('support_requests').insert({
    full_name,
    email,
    phone,
    reason,
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ result: `Hiba: ${error.message}` });
  }

  if (email) {
    await sendSupportReceived({ email, full_name, reason }).catch(() => undefined);
  }

  return NextResponse.json({
    result: `Köszönöm, ${full_name}! A kérvényt rögzítettem. 7-14 napon belül e-mailben válaszolunk${email ? ` a ${email} címre` : ''}.`,
  });
}
