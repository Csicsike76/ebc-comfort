import { sendEmail, SendEmailResult } from './resend';
import {
  orderConfirmationEmail,
  shippingUpdateEmail,
  npsSurveyEmail,
  supportRequestReceivedEmail,
} from './templates';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { Locale } from '@/lib/i18n/config';

type TemplateKey = 'order_confirmation' | 'shipping_update' | 'nps_survey' | 'support_received';

interface LogParams {
  to: string;
  template_key: TemplateKey;
  user_id?: string | null;
  subject: string;
  body_html: string;
  result: SendEmailResult;
}

async function logEmail(p: LogParams): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin.from('email_sent_log').insert({
    user_id: p.user_id ?? null,
    template_key: p.template_key,
    to_email: p.to,
    subject: p.subject,
    body_html: p.body_html,
    provider: 'resend',
    provider_message_id: p.result.id ?? null,
    status: p.result.ok ? 'sent' : p.result.placeholder ? 'placeholder' : 'failed',
  });
}

interface OrderEmailInput {
  locale: Locale;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_user_id?: string | null;
  total_cents: number;
  currency: string;
  items: { name: string; quantity: number; line_total_cents: number }[];
  shipping_address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  tracking_number?: string | null;
  tracking_url?: string | null;
}

export async function sendOrderConfirmation(o: OrderEmailInput): Promise<SendEmailResult> {
  const tmpl = orderConfirmationEmail(o.locale, o);
  const result = await sendEmail({
    to: o.customer_email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  });
  await logEmail({
    to: o.customer_email,
    template_key: 'order_confirmation',
    user_id: o.customer_user_id,
    subject: tmpl.subject,
    body_html: tmpl.html,
    result,
  });
  return result;
}

export async function sendShippingUpdate(o: OrderEmailInput): Promise<SendEmailResult> {
  const tmpl = shippingUpdateEmail(o.locale, o);
  const result = await sendEmail({
    to: o.customer_email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  });
  await logEmail({
    to: o.customer_email,
    template_key: 'shipping_update',
    user_id: o.customer_user_id,
    subject: tmpl.subject,
    body_html: tmpl.html,
    result,
  });
  return result;
}

export async function sendNpsSurvey(p: {
  locale: Locale;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_user_id?: string | null;
  survey_url: string;
}): Promise<SendEmailResult> {
  const tmpl = npsSurveyEmail(p.locale, p);
  const result = await sendEmail({
    to: p.customer_email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  });
  await logEmail({
    to: p.customer_email,
    template_key: 'nps_survey',
    user_id: p.customer_user_id,
    subject: tmpl.subject,
    body_html: tmpl.html,
    result,
  });
  return result;
}

export async function sendSupportReceived(p: {
  locale: Locale;
  email: string;
  full_name: string;
  reason: string;
  user_id?: string | null;
}): Promise<SendEmailResult> {
  const tmpl = supportRequestReceivedEmail(p.locale, {
    full_name: p.full_name,
    reason_excerpt: p.reason.slice(0, 300) + (p.reason.length > 300 ? '…' : ''),
  });
  const result = await sendEmail({
    to: p.email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  });
  await logEmail({
    to: p.email,
    template_key: 'support_received',
    user_id: p.user_id,
    subject: tmpl.subject,
    body_html: tmpl.html,
    result,
  });
  return result;
}
