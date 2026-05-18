'use client';
import { Locale } from '@/lib/i18n/config';

const LABEL: Record<string, string> = {
  hu: 'Cookie-beállítások',
  en: 'Cookie settings',
  de: 'Cookie-Einstellungen',
};

export default function CookieSettingsLink({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('ebc:open-cookie-settings'))}
      className="hover:underline cursor-pointer text-inherit"
    >
      {LABEL[locale] ?? LABEL.en}
    </button>
  );
}
