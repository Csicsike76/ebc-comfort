import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';
import { sendShippingUpdate } from '@/lib/email/send';
import { getBillingProvider } from '@/lib/billing/provider';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

interface OrderItemRow {
  id: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  products: { sku: string; slug: string } | null;
}

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  provider: string;
  status: string;
  reason: string | null;
  gross_cents: number;
  currency: string;
  pdf_url: string | null;
  issued_at: string | null;
  created_at: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  vat_cents: number;
  total_cents: number;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  shipping_method: string | null;
  notes: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  user_id: string | null;
  profiles: { email: string; full_name: string | null; phone: string | null } | null;
  order_items: OrderItemRow[];
}

const STATUSES = [
  'pending', 'paid', 'preparing', 'shipped',
  'delivered', 'returned', 'cancelled', 'refunded',
] as const;

export default async function AdminOrderDetail({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: orderData } = await supa
    .from('orders')
    .select(`
      id, order_number, status, currency,
      subtotal_cents, shipping_cents, vat_cents, total_cents,
      shipping_address, billing_address, shipping_method, notes,
      tracking_number, tracking_url,
      created_at, paid_at, shipped_at, delivered_at, user_id,
      profiles:profiles!orders_user_id_fkey ( email, full_name, phone ),
      order_items ( id, quantity, unit_price_cents, line_total_cents, products ( sku, slug ) )
    `)
    .eq('id', id)
    .single();

  if (!orderData) notFound();
  const order = orderData as unknown as OrderDetail;

  const { data: invoiceRows } = await supa
    .from('invoices')
    .select('id, invoice_number, provider, status, reason, gross_cents, currency, pdf_url, issued_at, created_at')
    .eq('order_id', id)
    .order('created_at', { ascending: false });
  const invoices = (invoiceRows ?? []) as InvoiceRow[];

  async function updateOrder(formData: FormData) {
    'use server';
    const { locale: lp, id: oid } = await params;
    const { supa: s } = await requireAdmin(lp);
    const status = String(formData.get('status') ?? '');
    const tracking_number = String(formData.get('tracking_number') ?? '') || null;
    const tracking_url = String(formData.get('tracking_url') ?? '') || null;
    const notes = String(formData.get('notes') ?? '') || null;
    if (!(STATUSES as readonly string[]).includes(status)) {
      throw new Error('Érvénytelen státusz');
    }
    const patch: Record<string, unknown> = { status, tracking_number, tracking_url, notes };
    if (status === 'shipped' && !order.shipped_at) patch.shipped_at = new Date().toISOString();
    if (status === 'delivered' && !order.delivered_at) patch.delivered_at = new Date().toISOString();
    if (status === 'paid' && !order.paid_at) patch.paid_at = new Date().toISOString();
    const { error } = await s.from('orders').update(patch).eq('id', oid);
    if (error) throw new Error(error.message);

    // Fire shipping-update email when transitioning to 'shipped'
    if (status === 'shipped' && order.status !== 'shipped') {
      const addr = order.shipping_address as { name?: string; street?: string; city?: string; postcode?: string; country?: string };
      const customerEmail = order.profiles?.email ?? '';
      if (customerEmail) {
        await sendShippingUpdate({
          order_number: order.order_number,
          customer_name: addr?.name ?? order.profiles?.full_name ?? 'Vásárló',
          customer_email: customerEmail,
          customer_user_id: order.user_id,
          total_cents: order.total_cents,
          currency: order.currency,
          items: order.order_items.map((it) => ({
            name: it.products?.sku ?? 'EBC Comfort',
            quantity: it.quantity,
            line_total_cents: it.line_total_cents,
          })),
          shipping_address: {
            street: addr?.street ?? '',
            city: addr?.city ?? '',
            postcode: addr?.postcode ?? '',
            country: addr?.country ?? '',
          },
          tracking_number,
          tracking_url,
        }).catch(() => undefined);
      }
    }

    revalidatePath(`/${lp}/admin/orders/${oid}`);
  }

  async function issueInvoiceAction() {
    'use server';
    const { locale: lp, id: oid } = await params;
    const { supa: s, userId } = await requireAdmin(lp);
    const { data: od } = await s
      .from('orders')
      .select('order_number, currency, subtotal_cents, vat_cents, total_cents, shipping_address, profiles:profiles!orders_user_id_fkey ( full_name )')
      .eq('id', oid)
      .single();
    if (!od) throw new Error('order not found');
    const o = od as unknown as {
      order_number: string;
      currency: string;
      subtotal_cents: number;
      vat_cents: number;
      total_cents: number;
      shipping_address: { name?: string; street?: string; city?: string; postcode?: string; country?: string } | null;
      profiles: { full_name: string | null } | null;
    };
    const buyerName = o.profiles?.full_name ?? o.shipping_address?.name ?? 'Vásárló';
    const res = await getBillingProvider().issueInvoice({
      orderId: oid,
      orderNumber: o.order_number,
      netCents: o.subtotal_cents,
      vatCents: o.vat_cents,
      grossCents: o.total_cents,
      currency: o.currency,
      buyerName,
      buyerAddress: o.shipping_address,
      items: [],
    });
    const status = res.ok ? 'issued' : res.reason === 'provider_error' ? 'failed' : 'blocked';
    const { error: e } = await s.from('invoices').insert({
      order_id: oid,
      provider: res.provider,
      invoice_number: res.invoiceNumber ?? null,
      external_id: res.externalId ?? null,
      status,
      reason: res.ok ? null : res.reason,
      net_cents: o.subtotal_cents,
      vat_cents: o.vat_cents,
      gross_cents: o.total_cents,
      currency: o.currency,
      buyer_name: buyerName,
      buyer_address: o.shipping_address,
      pdf_url: res.pdfUrl ?? null,
      issued_at: res.ok ? new Date().toISOString() : null,
      created_by: userId,
    });
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/orders/${oid}`);
  }

  const addr = order.shipping_address as { name?: string; street?: string; city?: string; postcode?: string; country?: string };

  return (
    <div className="max-w-5xl mx-auto safe-x py-10 space-y-8">
      <div>
        <Link href={`/${locale}/admin/orders`} className="text-xs text-[var(--color-muted)] hover:underline">
          ← Rendelések
        </Link>
        <h1 className="text-3xl font-bold">{order.order_number}</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Létrehozva: {formatDateTime(order.created_at)} ·{' '}
          <span className="font-semibold">{order.status}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-sm">
          <h2 className="font-bold mb-2">Vevő</h2>
          <p>{order.profiles?.full_name ?? '—'}</p>
          <p className="text-[var(--color-muted)]">{order.profiles?.email ?? 'vendég'}</p>
          {order.profiles?.phone && <p className="text-[var(--color-muted)]">{order.profiles.phone}</p>}
        </div>
        <div className="glass-card p-5 text-sm">
          <h2 className="font-bold mb-2">Szállítási cím</h2>
          <p>{addr?.name ?? '—'}</p>
          <p>{addr?.street ?? ''}</p>
          <p>
            {addr?.postcode ?? ''} {addr?.city ?? ''}
          </p>
          <p>{addr?.country ?? ''}</p>
          {order.shipping_method && (
            <p className="text-[var(--color-muted)] mt-2">Mód: {order.shipping_method}</p>
          )}
        </div>
        <div className="glass-card p-5 text-sm">
          <h2 className="font-bold mb-2">Összeg</h2>
          <Row label="Részösszeg" value={formatMoneyCents(order.subtotal_cents, order.currency)} />
          <Row label="Szállítás" value={formatMoneyCents(order.shipping_cents, order.currency)} />
          <Row label="ÁFA" value={formatMoneyCents(order.vat_cents, order.currency)} />
          <Row label="Összesen" value={formatMoneyCents(order.total_cents, order.currency)} bold />
          <p className="text-xs text-[var(--color-muted)] mt-3">
            Fizetve: {formatDateTime(order.paid_at)}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Feladva: {formatDateTime(order.shipped_at)}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Kézbesítve: {formatDateTime(order.delivered_at)}
          </p>
        </div>
      </div>

      <section className="glass-card p-5">
        <h2 className="font-bold mb-3">Tételek</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="py-2">SKU</th>
              <th className="py-2 text-right">Db</th>
              <th className="py-2 text-right">Egységár</th>
              <th className="py-2 text-right">Összesen</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((it) => (
              <tr key={it.id} className="border-t border-[var(--color-border)]">
                <td className="py-2 font-mono text-xs">{it.products?.sku ?? '—'}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right font-mono">
                  {formatMoneyCents(it.unit_price_cents, order.currency)}
                </td>
                <td className="py-2 text-right font-mono">
                  {formatMoneyCents(it.line_total_cents, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Számlázás</h2>
          <form action={issueInvoiceAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Számla kiállítása
            </button>
          </form>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Még nincs számla ehhez a rendeléshez.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-[var(--color-muted)]">
              <tr>
                <th className="py-2">Szám</th>
                <th className="py-2">Szolgáltató</th>
                <th className="py-2">Állapot</th>
                <th className="py-2 text-right">Bruttó</th>
                <th className="py-2">Dátum</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-[var(--color-border)]">
                  <td className="py-2 font-mono text-xs">
                    {inv.pdf_url ? (
                      <a href={inv.pdf_url} className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener">
                        {inv.invoice_number ?? 'PDF'}
                      </a>
                    ) : (
                      inv.invoice_number ?? '—'
                    )}
                  </td>
                  <td className="py-2 text-xs">{inv.provider}</td>
                  <td className="py-2"><InvoiceStatus status={inv.status} reason={inv.reason} /></td>
                  <td className="py-2 text-right font-mono">{formatMoneyCents(inv.gross_cents, inv.currency)}</td>
                  <td className="py-2 text-xs text-[var(--color-muted)]">{formatDateTime(inv.issued_at ?? inv.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-xs text-[var(--color-muted)] mt-3">
          A számlázó aktiválásához <code>SZAMLAZZHU_AGENT_KEY</code> + Kft/ÁFA-szám kell. Addig a számla
          <strong> „blokkolt”</strong> állapotban rögzül — a folyamat végpontig bekötve.
        </p>
      </section>

      <section className="glass-card p-5">
        <h2 className="font-bold mb-3">Státusz + követés</h2>
        <form action={updateOrder} className="space-y-3 text-sm">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Státusz
            </span>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Tracking-szám
            </span>
            <input
              type="text"
              name="tracking_number"
              defaultValue={order.tracking_number ?? ''}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Tracking URL
            </span>
            <input
              type="url"
              name="tracking_url"
              defaultValue={order.tracking_url ?? ''}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Belső megjegyzés
            </span>
            <textarea
              name="notes"
              defaultValue={order.notes ?? ''}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-xs"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Frissítés
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold border-t border-[var(--color-border)] pt-1 mt-1' : ''}`}>
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function InvoiceStatus({ status, reason }: { status: string; reason: string | null }) {
  const label: Record<string, string> = {
    issued: 'Kiállítva',
    blocked: 'Blokkolt',
    failed: 'Hiba',
    draft: 'Vázlat',
    storno: 'Sztornó',
  };
  const reasonLabel: Record<string, string> = {
    config_missing: 'nincs kulcs/Kft',
    not_live: 'nincs élesítve',
    not_implemented: 'nincs bekötve',
    provider_error: 'szolgáltató-hiba',
  };
  const color =
    status === 'issued' ? '#16a34a' : status === 'failed' ? '#dc2626' : 'var(--color-muted)';
  return (
    <span style={{ color }}>
      {label[status] ?? status}
      {reason && (
        <span className="text-xs text-[var(--color-muted)]"> · {reasonLabel[reason] ?? reason}</span>
      )}
    </span>
  );
}
