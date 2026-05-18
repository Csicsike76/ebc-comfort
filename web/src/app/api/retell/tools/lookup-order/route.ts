import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { verifyRetellSignature, isRetellConfigured } from '@/lib/retell';

export const runtime = 'nodejs';

/**
 * Retell custom tool endpoint: lookup_order
 * Called by the LLM during a call to fetch order status.
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

  let body: { args?: { order_number?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const orderNumber = body.args?.order_number?.trim();
  if (!orderNumber) {
    return NextResponse.json({ result: 'Missing order_number' });
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
      tracking_number, tracking_url
    `)
    .eq('order_number', orderNumber)
    .single();

  if (!order) {
    return NextResponse.json({
      result: `Nem találtam ${orderNumber} számú rendelést. Kérlek, ellenőrizd a formátumot: EBC-YYYYMM-XXXXX.`,
    });
  }

  const total = (order.total_cents / 100).toFixed(2) + ' ' + order.currency;
  const lines: string[] = [
    `Rendelés ${order.order_number}: státusz ${order.status}, összeg ${total}.`,
  ];
  if (order.paid_at) lines.push(`Fizetve: ${order.paid_at.slice(0, 10)}.`);
  if (order.shipped_at) lines.push(`Feladva: ${order.shipped_at.slice(0, 10)}.`);
  if (order.delivered_at) lines.push(`Kézbesítve: ${order.delivered_at.slice(0, 10)}.`);
  if (order.tracking_number) lines.push(`Követési szám: ${order.tracking_number}.`);

  return NextResponse.json({ result: lines.join(' ') });
}
