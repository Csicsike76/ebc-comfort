'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Locale } from '@/lib/i18n/config';
import { getAdminDict, type AdminDict } from '@/lib/i18n/admin';

interface Props {
  locale: Locale;
  email: string;
}

type TabKey = keyof AdminDict['nav']['tabs'];
type GroupKey = keyof AdminDict['nav']['groups'];
interface Item { key: TabKey; href: string; }
interface Group { key: GroupKey; items: Item[]; }

// ponytail: text-only items; add lucide icons later if the sidenav needs them
const GROUPS: Group[] = [
  { key: 'commerce', items: [
    { key: 'dashboard', href: '' },
    { key: 'products', href: '/products' },
    { key: 'orders', href: '/orders' },
    { key: 'support', href: '/support' },
  ] },
  { key: 'content', items: [
    { key: 'articles', href: '/articles' },
    { key: 'i18n', href: '/i18n' },
    { key: 'legal', href: '/legal-docs' },
  ] },
  { key: 'ai', items: [
    { key: 'chat', href: '/chat' },
    { key: 'calls', href: '/calls' },
  ] },
  { key: 'growth', items: [
    { key: 'analytics', href: '/analytics' },
    { key: 'marketing', href: '/marketing' },
    { key: 'donations', href: '/donations' },
  ] },
  { key: 'system', items: [
    { key: 'users', href: '/users' },
    { key: 'compliance', href: '/compliance' },
    { key: 'settings', href: '/settings' },
  ] },
];

export default function AdminNav({ locale, email }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dict = getAdminDict(locale);

  async function signOut() {
    const supa = getSupabaseBrowserClient();
    await supa.auth.signOut();
    router.push(`/${locale}`);
  }

  const isActive = (href: string) => {
    const full = `/${locale}/admin${href}`;
    if (href === '') return pathname === full || pathname === `/${locale}/admin/`;
    return pathname.startsWith(full);
  };

  const renderNav = () => (
    <>
      {GROUPS.map((g) => (
        <div key={g.key}>
          <div className="admin-side-group">{dict.nav.groups[g.key]}</div>
          {g.items.map((it) => (
            <a
              key={it.key}
              href={`/${locale}/admin${it.href}`}
              onClick={() => setOpen(false)}
              className={`admin-side-item${isActive(it.href) ? ' is-active' : ''}`}
            >
              {dict.nav.tabs[it.key]}
            </a>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar + drawer */}
      <header className="lg:hidden app-header">
        <div className="safe-x py-3 flex items-center justify-between gap-3">
          <a href={`/${locale}/admin`} className="flex items-center gap-2 font-bold">
            <span className="inline-block w-7 h-7 rounded-full bg-[var(--color-accent)]" />
            <span>{dict.nav.brand}</span>
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            className="px-3 py-1.5 rounded-full border border-[var(--color-border)] text-sm"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={dict.nav.brand}
          >
            ☰
          </button>
        </div>
        {open && (
          <div className="px-1 pb-2 max-h-[70vh] overflow-y-auto border-t border-[var(--color-border)]">
            {renderNav()}
            <div className="px-3 py-3 flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--color-muted)] truncate">{email}</span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-full border border-[var(--color-border)] flex-shrink-0"
              >
                {dict.nav.sign_out}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop sidenav */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen admin-sidenav overflow-y-auto">
        <a href={`/${locale}/admin`} className="flex items-center gap-2 font-bold px-4 py-4 flex-shrink-0">
          <span className="inline-block w-7 h-7 rounded-full bg-[var(--color-accent)]" />
          <span>{dict.nav.brand}</span>
        </a>
        <nav className="flex-1 pb-4">{renderNav()}</nav>
        <div className="flex-shrink-0 border-t border-[var(--color-border)] p-3 text-xs">
          <div className="text-[var(--color-muted)] truncate mb-2">{email}</div>
          <button
            onClick={signOut}
            className="w-full px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.nav.sign_out}
          </button>
        </div>
      </aside>
    </>
  );
}
