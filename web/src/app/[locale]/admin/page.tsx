import { redirect, notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminDict } from '@/lib/i18n/admin';

interface Props {
  params: Promise<{ locale: string }>;
}

// ponytail: Budapest midnight as a UTC ISO string; CET/CEST handled via Intl offset probe
function budapestDayStartISO(): string {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Budapest' }).format(now);
  const local = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' })).getTime();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const offsetMs = local - utc;
  return new Date(new Date(`${ymd}T00:00:00Z`).getTime() - offsetMs).toISOString();
}

function eur(cents: number): string {
  return '€' + Math.round(cents / 100).toLocaleString('hu-HU');
}

async function getStats() {
  const supa = await getSupabaseServerClient();
  const today = budapestDayStartISO();

  const [
    orders, donations, supportPending, supportTotal, chatTotal,
    articles, products, users, audit, callLogs,
    todayOrders, todayChat, todayPaid, todayCalls, revenuePaid, inventory,
  ] = await Promise.all([
    supa.from('orders').select('id', { count: 'exact', head: true }),
    supa.from('donations').select('id', { count: 'exact', head: true }),
    supa.from('support_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supa.from('support_requests').select('id', { count: 'exact', head: true }),
    supa.from('chat_conversations').select('id', { count: 'exact', head: true }),
    supa.from('articles').select('id', { count: 'exact', head: true }),
    supa.from('products').select('id', { count: 'exact', head: true }),
    supa.from('profiles').select('id', { count: 'exact', head: true }),
    supa.from('audit_log').select('id', { count: 'exact', head: true }),
    supa.from('call_logs').select('id', { count: 'exact', head: true }),
    supa.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supa.from('chat_conversations').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supa.from('orders').select('total_cents').gte('paid_at', today),
    supa.from('call_logs').select('duration_seconds').gte('created_at', today),
    // ponytail: sum in JS over paid orders; swap to an RPC sum() if the table grows large
    supa.from('orders').select('total_cents').not('paid_at', 'is', null),
    supa.from('inventory').select('stock_qty, reserved_qty, low_stock_threshold'),
  ]);

  const sumCents = (rows: { total_cents: number | null }[] | null) =>
    (rows ?? []).reduce((a, r) => a + (r.total_cents ?? 0), 0);

  const todayCallSecs = (todayCalls.data ?? []).reduce(
    (a, r: { duration_seconds: number | null }) => a + (r.duration_seconds ?? 0), 0,
  );

  const lowStock = (inventory.data ?? []).filter(
    (r: { stock_qty: number | null; reserved_qty: number | null; low_stock_threshold: number | null }) =>
      (r.stock_qty ?? 0) - (r.reserved_qty ?? 0) <= (r.low_stock_threshold ?? 0),
  ).length;

  return {
    orders: orders.count ?? 0,
    donations: donations.count ?? 0,
    supportPending: supportPending.count ?? 0,
    supportTotal: supportTotal.count ?? 0,
    chatTotal: chatTotal.count ?? 0,
    articles: articles.count ?? 0,
    products: products.count ?? 0,
    users: users.count ?? 0,
    audit: audit.count ?? 0,
    callLogs: callLogs.count ?? 0,
    todayOrders: todayOrders.count ?? 0,
    todayChat: todayChat.count ?? 0,
    todayRevenue: sumCents(todayPaid.data),
    todayCalls: (todayCalls.data ?? []).length,
    todayCallMins: Math.round(todayCallSecs / 60),
    revenueTotal: sumCents(revenuePaid.data),
    lowStock,
  };
}

export default async function AdminDashboard({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getAdminDict(locale);

  const supa = await getSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect(`/${locale}/admin/signin`);

  const { data: roles } = await supa
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  const isAdmin = (roles ?? []).some(
    (r: { role: string }) => r.role === 'admin' || r.role === 'super_admin'
  );
  if (!isAdmin) redirect(`/${locale}`);

  const s = await getStats();
  const t = dict.dashboard.today;

  const todayCards = [
    { label: t.orders, value: String(s.todayOrders) },
    { label: t.revenue, value: eur(s.todayRevenue) },
    { label: t.calls, value: `${s.todayCalls} · ${s.todayCallMins}p` },
    { label: t.support_open, value: String(s.supportPending) },
    { label: t.stock_alarm, value: String(s.lowStock), alarm: s.lowStock > 0 },
    { label: t.chat, value: String(s.todayChat) },
  ];

  const totals: { label: string; value: string; href?: string }[] = [
    { label: t.revenue_total, value: eur(s.revenueTotal), href: `/${locale}/admin/orders` },
    { label: dict.dashboard.cards.orders, value: String(s.orders), href: `/${locale}/admin/orders` },
    { label: dict.dashboard.cards.products, value: String(s.products), href: `/${locale}/admin/products` },
    { label: dict.dashboard.cards.support_pending, value: `${s.supportPending} / ${s.supportTotal}`, href: `/${locale}/admin/support` },
    { label: dict.dashboard.cards.chat, value: String(s.chatTotal), href: `/${locale}/admin/chat` },
    { label: dict.dashboard.cards.calls, value: String(s.callLogs), href: `/${locale}/admin/calls` },
    { label: dict.dashboard.cards.articles, value: String(s.articles), href: `/${locale}/admin/articles` },
    { label: dict.dashboard.cards.donations, value: String(s.donations), href: `/${locale}/admin/donations` },
    { label: dict.dashboard.cards.users, value: String(s.users) },
    { label: dict.dashboard.cards.audit, value: String(s.audit) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-1">{dict.dashboard.title}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {dict.dashboard.subtitle_prefix} · {user.email}
      </p>

      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3">
        {t.heading}
      </h2>
      <div className="stat-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-8">
        {todayCards.map((c) => (
          <div key={c.label} className={`stat stat--today${c.alarm ? ' stat--alarm' : ''}`}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3">
        {t.total_heading}
      </h2>
      <div className="stat-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {totals.map((c) =>
          c.href ? (
            <a key={c.label} href={c.href} className="block">
              <div className="stat">
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value}</div>
              </div>
            </a>
          ) : (
            <div key={c.label} className="stat">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
          )
        )}
      </div>

      <section className="mt-10 glass-card p-6">
        <h2 className="text-lg font-bold mb-3">{dict.dashboard.quick_actions.title}</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={`https://supabase.com/dashboard/project/kdfoaamnmzhrdbrzawtf/editor`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.dashboard.quick_actions.supabase} →
          </a>
          <a
            href={`https://supabase.com/dashboard/project/kdfoaamnmzhrdbrzawtf/auth/users`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.dashboard.quick_actions.auth_users} →
          </a>
          <a
            href={`https://app.netlify.com/projects/ebc-comfort`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.dashboard.quick_actions.netlify} →
          </a>
          <a
            href={`/${locale}/admin/gdpr`}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.dashboard.quick_actions.gdpr}
          </a>
        </div>
      </section>
    </div>
  );
}
