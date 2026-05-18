import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret, isStripeConfigured } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe not configured (placeholder mode)' },
      { status: 503 }
    );
  }
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 503 });
  }

  const sig = (await headers()).get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: `Signature verification failed: ${e instanceof Error ? e.message : 'unknown'}` },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY missing — cannot update orders from webhook' },
      { status: 503 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;

        const paid = session.payment_status === 'paid';
        const totalCents = session.amount_total ?? 0;

        await admin
          .from('orders')
          .update({
            status: paid ? 'paid' : 'pending',
            paid_at: paid ? new Date().toISOString() : null,
          })
          .eq('id', orderId);

        await admin
          .from('payments')
          .update({
            status: paid ? 'success' : 'pending',
            amount_cents: totalCents,
            completed_at: paid ? new Date().toISOString() : null,
            metadata: {
              checkout_session_id: session.id,
              payment_intent: session.payment_intent,
              customer_email: session.customer_details?.email,
            },
          })
          .eq('order_id', orderId)
          .eq('provider', 'stripe');
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
        }
        break;
      }

      case 'charge.refunded':
      case 'charge.refund.updated': {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (pi) {
          await admin
            .from('payments')
            .update({ status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded' })
            .eq('metadata->>payment_intent', pi);
        }
        break;
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Webhook handler error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true, type: event.type });
}
