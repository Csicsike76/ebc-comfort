import { redirect, notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ locale: string }>;
}

interface Stat {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}

async function getStats() {
  const supa = await getSupabaseServerClient();
  const [
    orders, donations, supportPending, supportTotal, chatTotal,
    articles, products, users, audit, callLogs,
  ] = await Promise.all([
    supa.from('orders').select('id, total_cents', { count: 'exact', head: true }),
    supa.from('donations').select('amount_cents', { count: 'exact', head: true }),
    supa.from('support_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supa.from('support_requests').select('id', { count: 'exact', head: true }),
    supa.from('chat_conversations').select('id', { count: 'exact', head: true }),
    supa.from('articles').select('id', { count: 'exact', head: true }),
    supa.from('products').select('id', { count: 'exact', head: true }),
    supa.from('profiles').select('id', { count: 'exact', head: true }),
    supa.from('audit_log').select('id', { count: 'exact', head: true }),
    supa.from('call_logs').select('id', { count: 'exact', head: true }),
  ]);

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
  };
}

export default async function AdminDashboard({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

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

  const stats = await getStats();

  const cards: Stat[] = [
    { label: 'Rendelések', value: String(stats.orders), href: `/${locale}/admin/orders` },
    { label: 'Donations', value: String(stats.donations), href: `/${locale}/admin/donations` },
    { label: 'Támogatási kérvény (függőben)', value: `${stats.supportPending} / ${stats.supportTotal}`, href: `/${locale}/admin/support` },
    { label: 'AI chat session', value: String(stats.chatTotal), href: `/${locale}/admin/chat` },
    { label: 'Cikkek', value: String(stats.articles), href: `/${locale}/admin/articles` },
    { label: 'Termékek', value: String(stats.products), href: `/${locale}/admin/products` },
    { label: 'Regisztrált felhasználók', value: String(stats.users), hint: 'profiles' },
    { label: 'Audit-log bejegyzés', value: String(stats.audit), hint: 'append-only' },
    { label: 'Telefonos hívás (Retell)', value: String(stats.callLogs), hint: 'jövőbeli' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Áttekintés</h1>
      <p className="text-sm text-[var(--color-muted)] mb-8">
        EBC NGO platform · {user.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const inner = (
            <div className="glass-card p-6 hover:border-[var(--color-accent)] transition-colors">
              <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                {c.label}
              </div>
              <div className="text-3xl font-bold mb-1">{c.value}</div>
              {c.hint && (
                <div className="text-xs text-[var(--color-muted)] italic">{c.hint}</div>
              )}
            </div>
          );
          return c.href ? (
            <a key={c.label} href={c.href}>{inner}</a>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <section className="mt-12 glass-card p-6">
        <h2 className="text-lg font-bold mb-3">Gyors-akciók</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={`https://supabase.com/dashboard/project/kdfoaamnmzhrdbrzawtf/editor`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            Supabase Studio →
          </a>
          <a
            href={`https://supabase.com/dashboard/project/kdfoaamnmzhrdbrzawtf/auth/users`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            Auth users →
          </a>
          <a
            href={`https://app.netlify.com/projects/ebc-comfort`}
            target="_blank"
            rel="noopener"
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            Netlify dashboard →
          </a>
          <a
            href={`/${locale}/admin/gdpr`}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            GDPR export/erase
          </a>
        </div>
      </section>
    </div>
  );
}
