import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRetellSignature, isRetellConfigured } from '@/lib/retell';

export const runtime = 'nodejs';

/**
 * Retell custom tool endpoint: lookup_order
 * Called by the LLM during a call to fetch order status.
 *
 * IDOR mitigation: order_number alone is enumerable (EBC-YYYYMM-XXXXX). We
 * require the LLM to pass BOTH order_number AND the caller's phone number
 * (from_number) coming from the Retell call context. We only return the
 * order if the order's billing/shipping phone matches the caller-id phone
 * (last-7-digits compare, both normalized).
 */
function normalizePhone(p: string | null | undefined): string {
  if (!p) return '';
  const digits = p.replace(/\D+/g, '');
  return digits.slice(-7); // last 7 digits — match HU/RO local numbers regardless of country code
}

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

  let body: {
    args?: { order_number?: string; caller_phone?: string };
    call?: { from_number?: string };
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const orderNumber = body.args?.order_number?.trim();
  if (!orderNumber) {
    return NextResponse.json({ result: 'Missing order_number' });
  }

  // Caller identity. Prefer Retell-supplied call.from_number; fall back to a
  // tool-arg only if the call object is unavailable.
  const callerPhoneRaw = body.call?.from_number ?? body.args?.caller_phone ?? '';
  const callerPhone = normalizePhone(callerPhoneRaw);
  if (!callerPhone) {
    return NextResponse.json({
      result: 'Adatvédelmi okból a rendelés-szám mellé szükségünk van a hívó telefonszámára.',
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ result: 'Backend unavailable' });
  }

  const { data: order } = await admin
    .from('orders')
    .select(`
      order_number, status, total_cents, currency,
      created_at, paid_at, shipped_at, delivered_at,
      tracking_number, tracking_url,
      billing_phone, shipping_phone
    `)
    .eq('order_number', orderNumber)
    .single();

  if (!order) {
    return NextResponse.json({
      result: `Nem találtam ${orderNumber} számú rendelést. Kérlek, ellenőrizd a formátumot: EBC-YYYYMM-XXXXX.`,
    });
  }

  const billPhone = normalizePhone(order.billing_phone as string | null);
  const shipPhone = normalizePhone(order.shipping_phone as string | null);
  if (callerPhone !== billPhone && callerPhone !== shipPhone) {
    // Do NOT confirm or deny order existence — generic message.
    return NextResponse.json({
      result: 'Adatvédelmi okból ezt a rendelést csak a megrendeléskor megadott telefonszámról tudom visszaigazolni. Kérlek, kérdezz e-mailben.',
    });
  }

  const total = (order.total_cents / 100).toFixed(2) + ' ' + order.currency;
  const lines: string[] = [
    `Rendelés ${order.order_number}: státusz ${order.status}, összeg ${total}.`,
  ];
  if (order.paid_at) lines.push(`Fizetve: ${(order.paid_at as string).slice(0, 10)}.`);
  if (order.shipped_at) lines.push(`Feladva: ${(order.shipped_at as string).slice(0, 10)}.`);
  if (order.delivered_at) lines.push(`Kézbesítve: ${(order.delivered_at as string).slice(0, 10)}.`);
  if (order.tracking_number) lines.push(`Követési szám: ${order.tracking_number}.`);

  return NextResponse.json({ result: lines.join(' ') });
}
