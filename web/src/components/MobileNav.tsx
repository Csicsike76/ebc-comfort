'use client';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  locale: Locale;
  items: NavItem[];
}

export default function MobileNav({ locale, items }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
          {open ? (
            <path d="M2 2 L16 12 M16 2 L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 3 L16 3" />
              <path d="M2 7 L16 7" />
              <path d="M2 11 L16 11" />
            </g>
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-x-0 top-16 z-[90] mx-3 sm:mx-4 glass-card p-3 shadow-2xl border border-[var(--color-accent)]/30 max-h-[80vh] overflow-y-auto"
        >
          <ul className="flex flex-col gap-1">
            {items.map((it) => (
              <li key={it.href}>
                <a
                  href={`/${locale}${it.href}`}
                  className="block px-4 py-3 rounded-xl text-base hover:bg-[var(--color-accent)]/10"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
