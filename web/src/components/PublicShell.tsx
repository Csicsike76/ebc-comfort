import BrandLogo from '@/components/BrandLogo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import AiChatWidget from '@/components/AiChatWidget';
import { Locale } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';

interface Props {
  locale: Locale;
  children: React.ReactNode;
}

export default function PublicShell({ locale, children }: Props) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="app-header">
        <div className="max-w-6xl mx-auto safe-x py-4 flex items-center justify-between gap-4">
          <a href={`/${locale}`} className="flex items-center gap-3 font-bold text-lg flex-shrink-0">
            <BrandLogo size={40} />
            <span className="hidden sm:inline">EBC Comfort</span>
          </a>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <a href={`/${locale}/termek`} className="hover:text-[var(--color-accent-2)]">
              {t('common.products')}
            </a>
            <a href={`/${locale}/edukacio`} className="hover:text-[var(--color-accent-2)]">
              {t('common.education')}
            </a>
            <a href={`/${locale}/tamogatas`} className="hover:text-[var(--color-accent-2)]">
              {t('common.support')}
            </a>
            <a href={`/${locale}/rolunk`} className="hover:text-[var(--color-accent-2)]">
              {t('common.about')}
            </a>
            <a href={`/${locale}/gyik`} className="hover:text-[var(--color-accent-2)]">
              GY.I.K.
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle locale={locale} />
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="app-footer">
        <div className="max-w-6xl mx-auto safe-x py-10 space-y-4">
          <div className="glass-card p-6 sm:p-8">
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
              {t('legal.footer_disclaimer')}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-[var(--color-muted)]">
              © 2026 EBC Wellness · {locale.toUpperCase()} ·{' '}
              <a href={`/${locale}/gyik`} className="hover:underline">
                GY.I.K.
              </a>{' '}
              ·{' '}
              <a href={`/${locale}/rolunk`} className="hover:underline">
                {t('common.about')}
              </a>
            </p>
          </div>
        </div>
      </footer>

      <AiChatWidget locale={locale} />
    </div>
  );
}
