'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, Locale } from '@/lib/i18n/config';

interface Props {
  currentLocale: Locale;
}

export default function LocaleSwitcher({ currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function pickLocale(l: Locale) {
    document.cookie = `ebc_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const segments = pathname.split('/');
    if (SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = l;
    } else {
      segments.splice(1, 0, l);
    }
    router.push(segments.join('/') || `/${l}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-base px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] flex items-center gap-1.5"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={LOCALE_NAMES[currentLocale]}
        title={LOCALE_NAMES[currentLocale]}
      >
        <span aria-hidden>{LOCALE_FLAGS[currentLocale]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute right-0 top-full mt-2 w-48 max-h-96 overflow-y-auto rounded-2xl glass-card p-1 z-50"
          role="listbox"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <li key={l}>
              <button
                onClick={() => pickLocale(l)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-[var(--color-accent)]/10 flex items-center gap-3 ${
                  l === currentLocale ? 'font-bold text-[var(--color-accent-2)]' : ''
                }`}
                role="option"
                aria-selected={l === currentLocale}
              >
                <span className="text-lg" aria-hidden>{LOCALE_FLAGS[l]}</span>
                <span>{LOCALE_NAMES[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
