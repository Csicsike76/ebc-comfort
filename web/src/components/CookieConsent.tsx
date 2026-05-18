'use client';
import { useEffect, useState } from 'react';
import {
  ConsentState,
  defaultConsent,
  readConsentFromCookie,
  writeConsentCookie,
  CONSENT_VERSION,
} from '@/lib/cookie-consent';
import { Locale } from '@/lib/i18n/config';
import { getCookieConsentDict } from '@/lib/i18n/cookie-consent-dict';

interface Props {
  locale: Locale;
}

export default function CookieConsent({ locale }: Props) {
  const t = getCookieConsentDict(locale);
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [state, setState] = useState<ConsentState>(defaultConsent());

  useEffect(() => {
    const existing = readConsentFromCookie();
    if (!existing) {
      setOpen(true);
    } else {
      setState(existing);
    }
    function onOpen() {
      const existing2 = readConsentFromCookie() ?? defaultConsent();
      setState(existing2);
      setShowCustomize(true);
      setOpen(true);
    }
    window.addEventListener('ebc:open-cookie-settings', onOpen);
    return () => window.removeEventListener('ebc:open-cookie-settings', onOpen);
  }, []);

  function save(s: ConsentState) {
    const payload: ConsentState = {
      ...s,
      necessary: true,
      decided_at: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    writeConsentCookie(payload);
    setState(payload);
    setOpen(false);
    if (typeof window !== 'undefined') {
      // Dispatch event so consent-gated components (UtmTracker, pixels) can
      // re-evaluate without a full page reload — but reload anyway so any
      // server-side gated content (analytics scripts) re-renders cleanly.
      window.dispatchEvent(new Event('ebc:consent-changed'));
      window.location.reload();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto glass-card p-5 sm:p-6 shadow-2xl border border-[var(--color-accent)]/30">
        <h2 className="text-lg font-bold mb-2">🍪 {t.title}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {t.body}{' '}
          <a
            href={`/${locale}/cookie-tajekoztato`}
            className="underline text-[var(--color-accent-2)]"
            target="_blank"
            rel="noopener"
          >
            {t.detailsLink}
          </a>
          .
        </p>

        {showCustomize && (
          <div className="mt-4 space-y-2 text-sm border-t border-[var(--color-border)] pt-4">
            <CatRow
              checked
              disabled
              label={t.cat_necessary}
              desc={t.cat_necessary_desc}
              onChange={() => undefined}
            />
            <CatRow
              checked={state.functional}
              label={t.cat_functional}
              desc={t.cat_functional_desc}
              onChange={(v) => setState((p) => ({ ...p, functional: v }))}
            />
            <CatRow
              checked={state.analytics}
              label={t.cat_analytics}
              desc={t.cat_analytics_desc}
              onChange={(v) => setState((p) => ({ ...p, analytics: v }))}
            />
            <CatRow
              checked={state.marketing}
              label={t.cat_marketing}
              desc={t.cat_marketing_desc}
              onChange={(v) => setState((p) => ({ ...p, marketing: v }))}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 justify-end">
          {!showCustomize && (
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
            >
              {t.customize}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              save({
                ...defaultConsent(),
                functional: false,
                analytics: false,
                marketing: false,
              })
            }
            className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
          >
            {t.onlyNecessary}
          </button>
          {showCustomize ? (
            <button
              type="button"
              onClick={() => save(state)}
              className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              {t.save}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                save({
                  ...defaultConsent(),
                  functional: true,
                  analytics: true,
                  marketing: true,
                })
              }
              className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              {t.acceptAll}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CatRow({
  checked,
  disabled,
  label,
  desc,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  desc: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-3 items-start cursor-pointer p-2 rounded-xl hover:bg-[var(--color-accent)]/5">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-[var(--color-muted)]">{desc}</div>
      </div>
    </label>
  );
}
