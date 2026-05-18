import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';
import { sendShippingUpdate } from '@/lib/email/send';

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
