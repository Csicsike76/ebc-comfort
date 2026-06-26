import { requireAdmin, formatMoneyCents } from '@/lib/admin/guard';
import { getAdminDict } from '@/lib/i18n/admin';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  params: Promise<{ locale: string }>;
}

const DAYS = 14;

export default async function AdminAnalytics({ params }: Props) {
  const { locale: localeParam } = await params;
  const { locale, supa } = await requireAdmin(localeParam);
  const a = getAdminDict(locale as Locale).dashboard.analytics;

  // ponytail: 14-day window from local midnight — enough for a launch dashboard
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS - 1));

  const { data: paid } = await supa
    .from('orders')
    .select('paid_at, total_cents')
    .not('paid_at', 'is', null)
    .gte('paid_at', start.toISOString());

  const buckets: { label: string; cents: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    buckets.push({ label: `${d.getMonth() + 1}.${d.getDate()}`, cents: 0 });
  }

  let total = 0;
  let count = 0;
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  for (const o of (paid ?? []) as { paid_at: string; total_cents: number }[]) {
    const d = new Date(o.paid_at);
    const idx = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - startUTC) / 864e5);
    if (idx >= 0 && idx < DAYS) buckets[idx].cents += o.total_cents ?? 0;
    total += o.total_cents ?? 0;
    count += 1;
  }
  const aov = count ? Math.round(total / count) : 0;
  const max = Math.max(1, ...buckets.map((b) => b.cents));

  const W = 720;
  const H = 220;
  const pad = 28;
  const bw = (W - pad * 2) / DAYS;

  return (
    <div className="max-w-7xl mx-auto safe-x py-8">
      <h1 className="text-3xl font-bold mb-1">{a.title}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {a.by_day} · {DAYS} {locale === 'hu' ? 'nap' : 'days'}
      </p>

      <div className="stat-grid grid-cols-1 sm:grid-cols-3 mb-8">
        <div className="stat stat--today">
          <div className="stat-label">{a.revenue_14d}</div>
          <div className="stat-value">{formatMoneyCents(total, 'EUR')}</div>
        </div>
        <div className="stat stat--today">
          <div className="stat-label">{a.paid_orders}</div>
          <div className="stat-value">{count}</div>
        </div>
        <div className="stat stat--today">
          <div className="stat-label">{a.aov}</div>
          <div className="stat-value">{formatMoneyCents(aov, 'EUR')}</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-4">
          {a.by_day}
        </h2>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={a.by_day}>
          {buckets.map((b, i) => {
            const h = Math.round((b.cents / max) * (H - pad * 2));
            const x = pad + i * bw;
            const y = H - pad - h;
            return (
              <g key={i}>
                <rect
                  x={x + 3}
                  y={y}
                  width={bw - 6}
                  height={h}
                  rx="3"
                  fill="var(--color-accent)"
                  opacity={b.cents ? 0.85 : 0.15}
                />
                <text
                  x={x + bw / 2}
                  y={H - pad + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-muted)"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
