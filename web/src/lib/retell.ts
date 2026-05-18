/**
 * Retell AI helpers.
 * Webhook signature verification (HMAC-SHA256) per Retell docs.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export function isRetellConfigured(): boolean {
  const key = process.env.RETELL_API_KEY;
  return !!key && !key.includes('PLACEHOLDER');
}

export function getRetellWebhookSecret(): string | null {
  const sec = process.env.RETELL_WEBHOOK_SECRET;
  if (!sec || sec.includes('PLACEHOLDER')) return null;
  return sec;
}

/**
 * Verify Retell webhook signature.
 * Retell sends `x-retell-signature: sha256=<hex>` header.
 */
export function verifyRetellSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = getRetellWebhookSecret();
  if (!secret) return false;
  if (!signatureHeader) return false;
  const provided = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader;
  const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (provided.length !== computed.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(computed, 'hex'));
  } catch {
    return false;
  }
}
