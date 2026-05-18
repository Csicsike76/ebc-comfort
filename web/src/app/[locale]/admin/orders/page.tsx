import Link from 'next/link';
import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  tracking_number: string | null;
  user_id: string | null;
  profiles: { email: string; full_name: string | null } | null;
}

const STATUSES = [
  'pending', 'paid', 'preparing', 'shipped',
  'delivered', 'returned', 'cancelled', 'refunded',
] as const;

export default async function AdminOrders({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { status } = await searchParams;
  const { locale, supa } = await requireAdmin(localeParam);

  let query = supa
    .from('orders')
    .select(`
      id, order_number, status, total_cents, currency,
      created_at, paid_at, tracking_number, user_id,
      profiles:profiles!orders_user_id_fkey ( email, full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && (STATUSES as readonly string[]).includes(status)) {
    query = query.eq('status', status);
  }

  const { data: orders, error } = await query;

  return (
    <div className="max-w-7xl mx-auto safe-x py-10">
      <h1 className="text-3xl font-bold mb-2">Rendelések</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {(orders ?? []).length} rendelés{status ? ` · szűrve: ${status}` : ''}
      </p>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <Link
          href={`/${locale}/admin/orders`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            !status ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          Mind
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
              status === s ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="glass-card p-4 mb-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Rendelés-szám</th>
              <th className="px-4 py-3 font-semibold">Vevő</th>
              <th className="px-4 py-3 font-semibold">Státusz</th>
              <th className="px-4 py-3 font-semibold text-right">Összeg</th>
              <th className="px-4 py-3 font-semibold">Követés</th>
              <th className="px-4 py-3 font-semibold">Létrehozva</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {((orders ?? []) as unknown as OrderRow[]).map((o) => (
              <tr key={o.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-3">
                  {o.profiles?.full_name ?? o.profiles?.email ?? <em className="text-[var(--color-muted)]">vendég</em>}
                </td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMoneyCents(o.total_cents, o.currency)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {o.tracking_number ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(o.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/${locale}/admin/orders/${o.id}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Megnyitás →
                  </Link>
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Nincs ilyen rendelés.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
