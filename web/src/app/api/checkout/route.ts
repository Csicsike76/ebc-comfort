import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { isValidLocale } from '@/lib/i18n/config';
import { sendOrderConfirmation } from '@/lib/email/send';
import {
  getVatRate,
  vatCentsFromNet,
  shippingCents as computeShipping,
} from '@/lib/vat';

interface CheckoutItem {
  product_id: string;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
}

// Pull utm_campaign/utm_source from the `ebc_utm` cookie set by UtmTracker.
// Fail-open: any parse error → no attribution, never throws into checkout.
function readUtmAttribution(req: Request): { utm_campaign: string | null; utm_source: string | null } {
  const empty = { utm_campaign: null, utm_source: null };
  try {
    const cookie = req.headers.get('cookie');
    if (!cookie) return empty;
    const m = cookie.split('; ').find((c) => c.startsWith('ebc_utm='));
    if (!m) return empty;
    const raw = JSON.parse(decodeURIComponent(m.slice('ebc_utm='.length))) as Record<string, unknown>;
    const cap = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 200) : null);
    return { utm_campaign: cap(raw.utm_campaign), utm_source: cap(raw.utm_source) };
  } catch {
    return empty;
  }
}

export async function POST(req: Request) {
  let payload: { locale: string; items: CheckoutItem[]; shipping_address: ShippingAddress };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Érvénytelen JSON' }, { status: 400 });
  }

  const { locale, items, shipping_address } = payload;
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: 'Érvénytelen locale' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'A kosár üres' }, { status: 400 });
  }
  if (!shipping_address?.name || !shipping_address?.email || !shipping_address?.street ||
      !shipping_address?.city || !shipping_address?.postcode || !shipping_address?.country) {
    return NextResponse.json({ error: 'Hiányzó szállítási adat' }, { status: 400 });
  }

  const userClient = await getSupabaseServerClient();
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing — server config incomplete' },
      { status: 500 }
    );
  }
  // Read user identity from the user-bound client (cookie-based session);
  // all DB writes go through admin to allow guest checkout + bypass RLS.
  const ids = items.map((i) => i.product_id);
  const { data: products, error: prodErr } = await admin
    .from('products')
    .select(`
      id, sku, status, base_price_cents, currency, vat_rate_pct,
      product_translations ( locale, name )
    `)
    .in('id', ids);

  if (prodErr) {
    return NextResponse.json({ error: `DB hiba: ${prodErr.message}` }, { status: 500 });
  }

  interface ProductRow {
    id: string;
    sku: string;
    status: string;
    base_price_cents: number;
    currency: string;
    vat_rate_pct: number;
    product_translations: { locale: string; name: string }[];
  }
  const productMap = new Map<string, ProductRow>();
  for (const p of (products ?? []) as ProductRow[]) {
    productMap.set(p.id, p);
  }

  let subtotalCents = 0;
  let currency = 'EUR';
  const lineItems: {
    product: ProductRow;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
    name: string;
  }[] = [];

  for (const it of items) {
    const p = productMap.get(it.product_id);
    if (!p) {
      return NextResponse.json({ error: `Ismeretlen termék: ${it.product_id}` }, { status: 400 });
    }
    if (it.quantity <= 0 || it.quantity > 99) {
      return NextResponse.json({ error: 'Érvénytelen mennyiség' }, { status: 400 });
    }
    const tr =
      p.product_translations.find((t) => t.locale === locale) ??
      p.product_translations.find((t) => t.locale === 'en') ??
      p.product_translations[0];
    const name = tr?.name ?? p.sku;
    const line = p.base_price_cents * it.quantity;
    subtotalCents += line;
    currency = p.currency;
    lineItems.push({
      product: p,
      quantity: it.quantity,
      unit_price_cents: p.base_price_cents,
      line_total_cents: line,
      name,
    });
  }

  // Free-shipping threshold + destination-country VAT (VAT-OSS pre-registration).
  const shippingCents = computeShipping(subtotalCents, lineItems.length);
  const vatRate = getVatRate(shipping_address.country);
  const vatCents = vatCentsFromNet(subtotalCents + shippingCents, vatRate);
  const totalCents = subtotalCents + shippingCents + vatCents;

  // Auth (optional — guest checkout allowed)
  const { data: { user } } = await userClient.auth.getUser();

  // Campaign attribution (F2 ROAS): the `ebc_utm` cookie holds a consent-gated
  // JSON payload written by UtmTracker. Best-effort + fail-open — a malformed or
  // absent cookie must never block a purchase. Untrusted text → length-capped.
  const attribution = readUtmAttribution(req);

  const { data: orderRow, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      status: 'pending',
      currency,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      vat_cents: vatCents,
      total_cents: totalCents,
      shipping_address,
      shipping_method: 'eu-standard',
      billing_phone: shipping_address.phone ?? null,
      shipping_phone: shipping_address.phone ?? null,
      utm_campaign: attribution.utm_campaign,
      utm_source: attribution.utm_source,
      locale,
    })
    .select('id, order_number')
    .single();

  if (orderErr || !orderRow) {
    return NextResponse.json(
      { error: `Rendelés-rögzítés hiba: ${orderErr?.message ?? 'unknown'}` },
      { status: 500 }
    );
  }

  const orderItemsRows = lineItems.map((l) => ({
    order_id: orderRow.id,
    product_id: l.product.id,
    quantity: l.quantity,
    unit_price_cents: l.unit_price_cents,
    // Use destination-country VAT (B2C VAT-OSS pre-registration). Falls back
    // to the per-product rate if the buyer's country is unknown.
    vat_rate_pct: vatRate * 100,
    line_total_cents: l.line_total_cents,
  }));
  const { error: itemsErr } = await admin.from('order_items').insert(orderItemsRows);
  if (itemsErr) {
    return NextResponse.json(
      { error: `Tétel-rögzítés hiba: ${itemsErr.message}` },
      { status: 500 }
    );
  }

  // Order-confirmation email (best-effort, non-blocking on failure)
  await sendOrderConfirmation({
    locale,
    order_number: orderRow.order_number,
    customer_name: shipping_address.name,
    customer_email: shipping_address.email,
    customer_user_id: user?.id ?? null,
    total_cents: totalCents,
    currency,
    items: lineItems.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      line_total_cents: l.line_total_cents,
    })),
    shipping_address: {
      street: shipping_address.street,
      city: shipping_address.city,
      postcode: shipping_address.postcode,
      country: shipping_address.country,
    },
  }).catch(() => undefined);

  if (!isStripeConfigured()) {
    return NextResponse.json({
      placeholder_redirect: true,
      order_number: orderRow.order_number,
      order_id: orderRow.id,
      reason: 'STRIPE_SECRET_KEY placeholder — order recorded as pending, no Stripe session.',
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe init failed' },
      { status: 500 }
    );
  }

  const origin = req.headers.get('origin') ?? `https://ebc-comfort.netlify.app`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: locale === 'hu' ? 'hu' : locale === 'de' ? 'de' : 'en',
      payment_method_types: ['card'],
      customer_email: shipping_address.email,
      line_items: [
        ...lineItems.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: l.unit_price_cents,
            product_data: {
              name: l.name,
              metadata: { product_id: l.product.id, sku: l.product.sku },
            },
          },
        })),
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: shippingCents,
            product_data: { name: 'Szállítás (EU standard)' },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: vatCents,
            product_data: {
              name: `VAT ${(vatRate * 100).toFixed(Number.isInteger(vatRate * 100) ? 0 : 1)}% (${shipping_address.country})`,
            },
          },
        },
      ],
      metadata: {
        order_id: orderRow.id,
        order_number: orderRow.order_number,
        locale,
      },
      success_url: `${origin}/${locale}/kosar/sikeres?order=${orderRow.order_number}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/kosar/megszakitott?order=${orderRow.order_number}`,
    });

    await admin
      .from('payments')
      .insert({
        order_id: orderRow.id,
        provider: 'stripe',
        provider_transaction_id: session.id,
        amount_cents: totalCents,
        currency,
        status: 'pending',
        metadata: { checkout_session_id: session.id },
      });

    return NextResponse.json({ url: session.url, order_number: orderRow.order_number });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Stripe error' },
      { status: 500 }
    );
  }
}
