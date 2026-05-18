/**
 * Resend transactional email client.
 * Direct REST API call — no SDK needed (smaller bundle).
 * Falls through silently if key is placeholder.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
  placeholder?: boolean;
}

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return !!key && !key.includes('PLACEHOLDER');
}

export async function sendEmail(p: SendEmailParams): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('PLACEHOLDER')) {
    return { ok: false, placeholder: true, error: 'RESEND_API_KEY placeholder' };
  }
  const from = process.env.RESEND_FROM_ADDRESS ?? 'EBC Comfort <noreply@ebc-wellness.eu>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [p.to],
        subject: p.subject,
        html: p.html,
        text: p.text,
        reply_to: p.reply_to,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${txt.slice(0, 200)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
}
