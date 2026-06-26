import type { BillingProvider, IssueInvoiceInput, IssueInvoiceResult } from './provider';

// Számlázz.hu "Számla Agent" adapter (Fázis 3).
//
// Requires: SZAMLAZZHU_AGENT_KEY + seller identity (SELLER_TAX_ID = ÁFA-szám)
// AND a registered Kft + ÁFA-szám — a HU invoice is invalid without them.
//
// Fail-closed by design: the real szamlazz.hu call is only attempted when
// BILLING_LIVE === 'true'. The XML builder below is pure + unit-tested, but the
// LIVE path MUST be validated against a szamlazz.hu Agent test account before
// BILLING_LIVE is flipped — the live validator can reject XML this code can't
// see is wrong (seller data, tax mode, e-invoice flags).
const AGENT_URL = 'https://www.szamlazz.hu/szamla/';
const XSD = 'http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
}

// cents → currency major units string (e.g. 1270 -> "12.7", 1500 -> "15").
function units(cents: number): string {
  return (cents / 100).toFixed(2).replace(/\.?0+$/, '');
}

interface BuildOpts {
  key: string;
  today: string;        // YYYY-MM-DD
  paymentMode: string;  // szamlazz "fizmod"
}

// Pure XML builder — exported so it can be unit-tested without a network call.
export function buildSzamlaXml(input: IssueInvoiceInput, opts: BuildOpts): string {
  const b = input.buyerAddress;
  const tetelek = input.items.map((it) => {
    const net = it.unitNetCents * it.quantity;
    const vat = Math.round(net * (it.vatRate / 100));
    return `    <tetel>
      <megnevezes>${esc(it.name)}</megnevezes>
      <mennyiseg>${it.quantity}</mennyiseg>
      <mennyisegiEgyseg>db</mennyisegiEgyseg>
      <nettoEgysegar>${units(it.unitNetCents)}</nettoEgysegar>
      <afakulcs>${it.vatRate}</afakulcs>
      <nettoErtek>${units(net)}</nettoErtek>
      <afaErtek>${units(vat)}</afaErtek>
      <bruttoErtek>${units(net + vat)}</bruttoErtek>
    </tetel>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${XSD}">
  <beallitasok>
    <szamlaagentkulcs>${esc(opts.key)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
  </beallitasok>
  <fejlec>
    <keltDatum>${opts.today}</keltDatum>
    <teljesitesDatum>${opts.today}</teljesitesDatum>
    <fizetesiHataridoDatum>${opts.today}</fizetesiHataridoDatum>
    <fizmod>${esc(opts.paymentMode)}</fizmod>
    <penznem>${esc(input.currency)}</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${esc(input.orderNumber)}</megjegyzes>
  </fejlec>
  <elado></elado>
  <vevo>
    <nev>${esc(input.buyerName)}</nev>
    <irsz>${esc(b?.postcode ?? '')}</irsz>
    <telepules>${esc(b?.city ?? '')}</telepules>
    <cim>${esc(b?.street ?? '')}</cim>
    ${input.buyerTaxId ? `<adoszam>${esc(input.buyerTaxId)}</adoszam>` : ''}
  </vevo>
  <tetelek>
${tetelek}
  </tetelek>
</xmlszamla>`;
}

export class SzamlazzHuProvider implements BillingProvider {
  readonly name = 'szamlazzhu';

  async issueInvoice(input: IssueInvoiceInput): Promise<IssueInvoiceResult> {
    const key = process.env.SZAMLAZZHU_AGENT_KEY;
    const sellerTaxId = process.env.SELLER_TAX_ID;

    if (!key || !sellerTaxId) {
      return { ok: false, provider: this.name, reason: 'config_missing' };
    }
    if (process.env.BILLING_LIVE !== 'true') {
      return { ok: false, provider: this.name, reason: 'not_live' };
    }

    const today = new Date().toISOString().slice(0, 10);
    const xml = buildSzamlaXml(input, { key, today, paymentMode: 'bankkártya' });

    try {
      const form = new FormData();
      form.append('action-xmlagentxmlfile', new Blob([xml], { type: 'text/xml' }), 'szamla.xml');
      const res = await fetch(AGENT_URL, { method: 'POST', body: form });

      // szamlazz signals errors via response headers, not HTTP status.
      const errCode = res.headers.get('szlahu_error_code');
      if (errCode) {
        return { ok: false, provider: this.name, reason: 'provider_error' };
      }
      const invoiceNumber = res.headers.get('szlahu_szamlaszam') ?? undefined;
      if (!invoiceNumber) {
        return { ok: false, provider: this.name, reason: 'provider_error' };
      }
      return { ok: true, provider: this.name, invoiceNumber, externalId: invoiceNumber };
    } catch {
      return { ok: false, provider: this.name, reason: 'provider_error' };
    }
  }
}
