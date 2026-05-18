'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Locale } from '@/lib/i18n/config';
import { getAdminDict, type AdminDict } from '@/lib/i18n/admin';

interface Props {
  locale: Locale;
  email: string;
}

interface Tab {
  key: keyof AdminDict['nav']['tabs'];
  href: string;
}

const TABS: Tab[] = [
  { key: 'dashboard', href: '' },
  { key: 'products', href: '/products' },
  { key: 'orders', href: '/orders' },
  { key: 'support', href: '/support' },
  { key: 'articles', href: '/articles' },
  { key: 'donations', href: '/donations' },
  { key: 'chat', href: '/chat' },
  { key: 'calls', href: '/calls' },
  { key: 'marketing', href: '/marketing' },
  { key: 'users', href: '/users' },
  { key: 'i18n', href: '/i18n' },
  { key: 'legal', href: '/legal-docs' },
  { key: 'compliance', href: '/compliance' },
  { key: 'settings', href: '/settings' },
];

export default function AdminNav({ locale, email }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dict = getAdminDict(locale);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    const supa = getSupabaseBrowserClient();
    await supa.auth.signOut();
    router.push(`/${locale}`);
  }

  const currentTab = TABS.find((t) => {
    const full = `/${locale}/admin${t.href}`;
    if (t.href === '') return pathname === full || pathname === `/${locale}/admin/`;
    return pathname.startsWith(full);
  }) ?? TABS[0];

  const tabLabel = (key: Tab['key']) => dict.nav.tabs[key];

  return (
    <header className="app-header">
      <div className="max-w-7xl mx-auto safe-x py-3 flex items-center justify-between gap-3">
        <a href={`/${locale}/admin`} className="flex items-center gap-2 font-bold flex-shrink-0">
          <span className="inline-block w-7 h-7 rounded-full bg-[var(--color-accent)]" />
          <span className="hidden sm:inline">{dict.nav.brand}</span>
        </a>

        {/* Desktop tabs */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {TABS.map((t) => {
            const full = `/${locale}/admin${t.href}`;
            const active = currentTab.key === t.key;
            return (
              <a
                key={t.key}
                href={full}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'hover:bg-[var(--color-accent)]/10'
                }`}
              >
                {tabLabel(t.key)}
              </a>
            );
          })}
        </nav>

        {/* Mobile dropdown trigger */}
        <div ref={ref} className="relative lg:hidden flex-1">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-sm"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span>☰ {tabLabel(currentTab.key)}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          {open && (
            <ul
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl glass-card p-1 z-50 max-h-[60vh] overflow-y-auto"
              role="menu"
            >
              {TABS.map((t) => (
                <li key={t.key}>
                  <a
                    href={`/${locale}/admin${t.href}`}
                    className={`block px-3 py-2 rounded-xl text-sm hover:bg-[var(--color-accent)]/10 ${
                      currentTab.key === t.key ? 'font-bold text-[var(--color-accent-2)]' : ''
                    }`}
                    role="menuitem"
                  >
                    {tabLabel(t.key)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          <span className="hidden xl:inline text-[var(--color-muted)]">{email}</span>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          >
            {dict.nav.sign_out}
          </button>
        </div>
      </div>
    </header>
  );
}
