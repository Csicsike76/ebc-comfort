import type { Locale } from '@/lib/i18n/config';
import { getEmailDict, formatEmailMoney, type EmailDict } from './i18n';

interface OrderTemplateData {
  order_number: string;
  customer_name: string;
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

function interp(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function shell(d: EmailDict, title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#fbfaf9;font-family:-apple-system,system-ui,sans-serif;color:#1c1a18;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 6px;color:#5c4e3e;">EBC Comfort</h1>
    <p style="font-size:11px;color:#6b665f;margin:0 0 24px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(d.footer_tag)}</p>
    <div style="background:#fff;border:1px solid #e7e1d8;border-radius:16px;padding:24px;">
      ${body}
    </div>
    <p style="font-size:11px;color:#6b665f;margin:24px 0 0;text-align:center;">
      © 2026 EBC Wellness · <a href="https://ebc-comfort.netlify.app" style="color:#8b7355;">ebc-comfort.netlify.app</a><br>
      ${escapeHtml(d.footer_legal)}
    </p>
  </div>
</body></html>`;
}

export function orderConfirmationEmail(locale: Locale, o: OrderTemplateData) {
  const d = getEmailDict(locale);
  const money = (c: number) => formatEmailMoney(c, o.currency, locale);
  const itemRows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 0;text-align:center;">${i.quantity}×</td>
        <td style="padding:8px 0;text-align:right;font-family:monospace;">${money(i.line_total_cents)}</td>
      </tr>`
    )
    .join('');
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(d.order.heading)}</h2>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(interp(d.greeting, { name: o.customer_name }))}</p>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(d.order.intro)}</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">${escapeHtml(d.order_number_label)}</p>
    <p style="margin:0 0 16px;font-family:monospace;font-size:16px;font-weight:bold;">${escapeHtml(o.order_number)}</p>
    <table style="width:100%;border-top:1px solid #e7e1d8;border-bottom:1px solid #e7e1d8;font-size:14px;margin:16px 0;">
      ${itemRows}
    </table>
    <p style="margin:8px 0;font-size:14px;display:flex;justify-content:space-between;">
      <strong>${escapeHtml(d.order.payable)}:</strong>
      <strong style="font-family:monospace;">${money(o.total_cents)}</strong>
    </p>
    <hr style="border:none;border-top:1px solid #e7e1d8;margin:20px 0;">
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">${escapeHtml(d.order.shipping_address)}</p>
    <p style="margin:0;font-size:14px;line-height:1.5;">
      ${escapeHtml(o.shipping_address.street)}<br>
      ${escapeHtml(o.shipping_address.postcode)} ${escapeHtml(o.shipping_address.city)}<br>
      ${escapeHtml(o.shipping_address.country)}
    </p>
  `;
  return {
    subject: interp(d.order.subject, { order_number: o.order_number }),
    html: shell(d, d.order.title, body),
    text: `${d.order.heading}\n\n${d.order_number_label}: ${o.order_number}\n${d.order.payable}: ${money(o.total_cents)}\n\n${d.order.intro}\n\nEBC Comfort · ebc-comfort.netlify.app`,
  };
}

export function shippingUpdateEmail(locale: Locale, o: OrderTemplateData) {
  const d = getEmailDict(locale);
  const tracking = o.tracking_number
    ? `<p style="margin:0 0 6px;font-size:12px;color:#6b665f;">${escapeHtml(d.shipping.tracking_label)}</p>
       <p style="margin:0 0 16px;font-family:monospace;font-size:14px;">${escapeHtml(o.tracking_number)}</p>
       ${o.tracking_url ? `<p style="margin:0 0 16px;"><a href="${escapeHtml(o.tracking_url)}" style="color:#8b7355;">${escapeHtml(d.shipping.track_link)}</a></p>` : ''}`
    : `<p style="margin:0 0 16px;font-size:14px;color:#6b665f;">${escapeHtml(d.shipping.tracking_pending)}</p>`;
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(d.shipping.heading)}</h2>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(interp(d.greeting, { name: o.customer_name }))}</p>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(d.shipping.intro)}</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">${escapeHtml(d.order_number_label)}</p>
    <p style="margin:0 0 16px;font-family:monospace;font-size:16px;font-weight:bold;">${escapeHtml(o.order_number)}</p>
    ${tracking}
  `;
  return {
    subject: interp(d.shipping.subject, { order_number: o.order_number }),
    html: shell(d, d.shipping.title, body),
    text: `${d.shipping.heading}\n\n${d.order_number_label}: ${o.order_number}\n${o.tracking_number ? `${d.shipping.tracking_label}: ${o.tracking_number}\n` : ''}${o.tracking_url ? `${o.tracking_url}\n` : ''}\n${d.shipping.intro}`,
  };
}

export function npsSurveyEmail(locale: Locale, o: { order_number: string; customer_name: string; survey_url: string }) {
  const d = getEmailDict(locale);
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(d.nps.heading)}</h2>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(interp(d.greeting, { name: o.customer_name }))}</p>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(d.nps.intro)}</p>
    <p style="margin:0 0 16px;text-align:center;">
      <a href="${escapeHtml(o.survey_url)}" style="display:inline-block;padding:12px 32px;background:#8b7355;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">
        ${escapeHtml(d.nps.cta)}
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#6b665f;">${escapeHtml(d.order_number_label)}: ${escapeHtml(o.order_number)}</p>
  `;
  return {
    subject: d.nps.subject,
    html: shell(d, d.nps.title, body),
    text: `${d.nps.heading}\n${d.nps.cta} ${o.survey_url}\n\n${d.order_number_label}: ${o.order_number}`,
  };
}

export function supportRequestReceivedEmail(locale: Locale, p: { full_name: string; reason_excerpt: string }) {
  const d = getEmailDict(locale);
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(d.support.heading)}</h2>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(interp(d.greeting, { name: p.full_name }))}</p>
    <p style="margin:0 0 16px;font-size:14px;">${escapeHtml(d.support.intro)}</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">${escapeHtml(d.support.excerpt_label)}</p>
    <p style="margin:0 0 16px;font-size:14px;font-style:italic;border-left:3px solid #8b7355;padding-left:12px;">${escapeHtml(p.reason_excerpt)}</p>
    <p style="margin:0;font-size:12px;color:#6b665f;">${escapeHtml(d.support.reply_hint)}</p>
  `;
  return {
    subject: d.support.subject,
    html: shell(d, d.support.title, body),
    text: `${d.support.heading}\n\n${d.support.intro}\n\n— EBC Wellness`,
  };
}
