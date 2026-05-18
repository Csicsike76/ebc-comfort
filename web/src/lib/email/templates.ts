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

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#fbfaf9;font-family:-apple-system,system-ui,sans-serif;color:#1c1a18;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 6px;color:#5c4e3e;">EBC Comfort</h1>
    <p style="font-size:11px;color:#6b665f;margin:0 0 24px;text-transform:uppercase;letter-spacing:1px;">Wellness brand · NEM orvosi eszköz</p>
    <div style="background:#fff;border:1px solid #e7e1d8;border-radius:16px;padding:24px;">
      ${body}
    </div>
    <p style="font-size:11px;color:#6b665f;margin:24px 0 0;text-align:center;">
      © 2026 EBC Wellness · <a href="https://ebc-comfort.netlify.app" style="color:#8b7355;">ebc-comfort.netlify.app</a><br>
      EBC Comfort wellness-eszköz, nem orvosi eszköz. Egészségügyi panasz esetén keress szakorvost.
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function orderConfirmationEmail(o: OrderTemplateData) {
  const itemRows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;">${escapeHtml(i.name)}</td>
        <td style="padding:8px 0;text-align:center;">${i.quantity}×</td>
        <td style="padding:8px 0;text-align:right;font-family:monospace;">${formatMoney(i.line_total_cents, o.currency)}</td>
      </tr>`
    )
    .join('');
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">Köszönjük a megrendelést!</h2>
    <p style="margin:0 0 16px;font-size:14px;">Kedves <strong>${escapeHtml(o.customer_name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;">A rendelésedet fogadtuk. Visszaigazolás a státusz-változásokról e-mailben érkezik.</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">Rendelés-szám</p>
    <p style="margin:0 0 16px;font-family:monospace;font-size:16px;font-weight:bold;">${escapeHtml(o.order_number)}</p>
    <table style="width:100%;border-top:1px solid #e7e1d8;border-bottom:1px solid #e7e1d8;font-size:14px;margin:16px 0;">
      ${itemRows}
    </table>
    <p style="margin:8px 0;font-size:14px;display:flex;justify-content:space-between;">
      <strong>Fizetendő:</strong>
      <strong style="font-family:monospace;">${formatMoney(o.total_cents, o.currency)}</strong>
    </p>
    <hr style="border:none;border-top:1px solid #e7e1d8;margin:20px 0;">
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">Szállítási cím</p>
    <p style="margin:0;font-size:14px;line-height:1.5;">
      ${escapeHtml(o.shipping_address.street)}<br>
      ${escapeHtml(o.shipping_address.postcode)} ${escapeHtml(o.shipping_address.city)}<br>
      ${escapeHtml(o.shipping_address.country)}
    </p>
  `;
  return {
    subject: `EBC Comfort — Megrendelés rögzítve · ${o.order_number}`,
    html: shell('Megrendelés rögzítve', body),
    text: `Köszönjük a megrendelést!\n\nRendelés-szám: ${o.order_number}\nÖsszeg: ${formatMoney(o.total_cents, o.currency)}\n\nA visszaigazolás a státusz-változásokról e-mailben érkezik.\n\nEBC Comfort · ebc-comfort.netlify.app`,
  };
}

export function shippingUpdateEmail(o: OrderTemplateData) {
  const tracking = o.tracking_number
    ? `<p style="margin:0 0 6px;font-size:12px;color:#6b665f;">Követési szám</p>
       <p style="margin:0 0 16px;font-family:monospace;font-size:14px;">${escapeHtml(o.tracking_number)}</p>
       ${o.tracking_url ? `<p style="margin:0 0 16px;"><a href="${escapeHtml(o.tracking_url)}" style="color:#8b7355;">Csomag követése →</a></p>` : ''}`
    : '<p style="margin:0 0 16px;font-size:14px;color:#6b665f;">A futárszolgálati követési szám hamarosan érkezik.</p>';
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">📦 A csomagod elindult!</h2>
    <p style="margin:0 0 16px;font-size:14px;">Kedves <strong>${escapeHtml(o.customer_name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;">A rendelésedet feladtuk. 2-5 munkanapon belül kézbesítik a megadott címre.</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">Rendelés-szám</p>
    <p style="margin:0 0 16px;font-family:monospace;font-size:16px;font-weight:bold;">${escapeHtml(o.order_number)}</p>
    ${tracking}
  `;
  return {
    subject: `EBC Comfort — Csomagod elindult · ${o.order_number}`,
    html: shell('Csomag feladva', body),
    text: `A csomagod elindult!\n\nRendelés-szám: ${o.order_number}\n${o.tracking_number ? `Követési szám: ${o.tracking_number}\n` : ''}${o.tracking_url ? `Követés: ${o.tracking_url}\n` : ''}\n2-5 munkanapon belül kézbesítik.`,
  };
}

export function npsSurveyEmail(o: { order_number: string; customer_name: string; survey_url: string }) {
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">Hogy tetszik az EBC Comfort?</h2>
    <p style="margin:0 0 16px;font-size:14px;">Kedves <strong>${escapeHtml(o.customer_name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;">30 napja, hogy megrendelted az EBC Comfortot. Szeretnénk megkérdezni, hogyan vált be neked. 1 percet vesz igénybe és sokat segít a fejlesztésben.</p>
    <p style="margin:0 0 16px;text-align:center;">
      <a href="${escapeHtml(o.survey_url)}" style="display:inline-block;padding:12px 32px;background:#8b7355;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">
        Visszajelzés küldése →
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#6b665f;">Rendelés-szám: ${escapeHtml(o.order_number)}</p>
  `;
  return {
    subject: `EBC Comfort — Hogy vált be? · 1 perces visszajelzés`,
    html: shell('Visszajelzés kérése', body),
    text: `Hogy tetszik az EBC Comfort? 1 perc visszajelzés: ${o.survey_url}\n\nRendelés-szám: ${o.order_number}`,
  };
}

export function supportRequestReceivedEmail(p: { full_name: string; reason_excerpt: string }) {
  const body = `
    <h2 style="margin:0 0 12px;font-size:18px;">A kérvényedet megkaptuk</h2>
    <p style="margin:0 0 16px;font-size:14px;">Kedves <strong>${escapeHtml(p.full_name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:14px;">Köszönjük, hogy a támogatási programunkhoz fordultál. 7-14 munkanapon belül e-mailben válaszolunk.</p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b665f;">A kérvényed kivonata</p>
    <p style="margin:0 0 16px;font-size:14px;font-style:italic;border-left:3px solid #8b7355;padding-left:12px;">${escapeHtml(p.reason_excerpt)}</p>
    <p style="margin:0;font-size:12px;color:#6b665f;">Ha kérdésed van, válaszolj erre az e-mailre.</p>
  `;
  return {
    subject: `EBC Comfort — Támogatási kérvény fogadva`,
    html: shell('Támogatási kérvény fogadva', body),
    text: `A kérvényedet megkaptuk. 7-14 munkanapon belül válaszolunk.\n\n— EBC Wellness támogatási csapat`,
  };
}
