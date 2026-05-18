'use client';
import { useEffect, useState } from 'react';
import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

type Mode = 'light' | 'dark' | 'system';
const COOKIE = 'ebc_theme';

function readCookie(): Mode {
  if (typeof document === 'undefined') return 'system';
  const m = document.cookie
    .split('; ')
    .find((c) => c.startsWith(COOKIE + '='))
    ?.split('=')[1];
  if (m === 'light' || m === 'dark' || m === 'system') return m;
  return 'system';
}

function applyMode(mode: Mode) {
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  document.cookie = `${COOKIE}=${mode}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export default function ThemeToggle({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(readCookie());
    setMounted(true);
  }, []);

  // React to system theme change when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyMode('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  function cycle() {
    const next: Mode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
    applyMode(next);
  }

  if (!mounted) {
    return <span className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] opacity-50">…</span>;
  }

  const label =
    mode === 'light' ? t('common.theme_light')
    : mode === 'dark' ? t('common.theme_dark')
    : t('common.theme_system');
  const icon = mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🌗';

  return (
    <button
      onClick={cycle}
      aria-label={label}
      title={label}
      className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
    >
      {icon}
    </button>
  );
}
