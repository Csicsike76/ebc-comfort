import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
}

interface DonationRow {
  id: string;
  amount_cents: number;
  currency: string;
  message: string | null;
  is_anonymous: boolean;
  recognized_publicly: boolean;
  created_at: string;
  donor_id: string | null;
  profiles: { email: string; full_name: string | null } | null;
}

export default async function AdminDonations({ params }: Props) {
  const { locale: localeParam } = await params;
  const { supa } = await requireAdmin(localeParam);

  const { data: donations, error } = await supa
    .from('donations')
    .select(`
      id, amount_cents, currency, message, is_anonymous, recognized_publicly,
      created_at, donor_id,
      profiles ( email, full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  const rows = ((donations ?? []) as unknown as DonationRow[]);

  const monthly = new Map<string, number>();
  for (const d of rows) {
    const m = d.created_at.slice(0, 7);
    monthly.set(m, (monthly.get(m) ?? 0) + d.amount_cents);
  }
  const monthlyEntries = Array.from(monthly.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 12);
  const maxMonthly = Math.max(1, ...monthlyEntries.map(([, v]) => v));
  const totalAll = rows.reduce((s, d) => s + d.amount_cents, 0);

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Donations</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {rows.length} adományzás · összesen {formatMoneyCents(totalAll)}
        </p>
      </div>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">Havi bevétel (utolsó 12 hó)</h2>
        {monthlyEntries.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Még nincs adat.</p>
        ) : (
          <ul className="space-y-2">
            {monthlyEntries.map(([month, cents]) => (
              <li key={month} className="flex items-center gap-3 text-sm">
                <span className="w-20 font-mono text-xs">{month}</span>
                <div className="flex-1 h-6 bg-[var(--color-accent)]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)]"
                    style={{ width: `${(cents / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="w-32 text-right font-mono">{formatMoneyCents(cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-card overflow-x-auto">
        <h2 className="text-lg font-bold p-5 pb-3">Részletes lista</h2>
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Dátum</th>
              <th className="px-4 py-3 font-semibold">Adományzó</th>
              <th className="px-4 py-3 font-semibold text-right">Összeg</th>
              <th className="px-4 py-3 font-semibold">Üzenet</th>
              <th className="px-4 py-3 font-semibold">Beállítás</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(d.created_at)}
                </td>
                <td className="px-4 py-3">
                  {d.is_anonymous ? (
                    <em className="text-[var(--color-muted)]">Névtelen</em>
                  ) : (
                    d.profiles?.full_name ?? d.profiles?.email ?? '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatMoneyCents(d.amount_cents, d.currency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {d.message ? (
                    <span className="line-clamp-2">{d.message}</span>
                  ) : (
                    <em className="text-[var(--color-muted)]">—</em>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {d.recognized_publicly ? '🌐 publikus' : '🔒 priv'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs adományzás.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
