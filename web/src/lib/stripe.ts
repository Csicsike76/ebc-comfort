import Stripe from 'stripe';

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('PLACEHOLDER')) return null;
  return new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  });
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && !key.includes('PLACEHOLDER');
}

export function getStripeWebhookSecret(): string | null {
  const sec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sec || sec.includes('PLACEHOLDER')) return null;
  return sec;
}
