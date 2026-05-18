import { getDict, tt } from '@/lib/i18n';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import AiChatWidget from '@/components/AiChatWidget';
import BrandLogo from '@/components/BrandLogo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — opaque sticky */}
      <header className="app-header">
        <div className="max-w-6xl mx-auto safe-x py-4 flex items-center justify-between gap-4">
          <a href={`/${locale}`} className="flex items-center gap-3 font-bold text-lg flex-shrink-0">
            <BrandLogo size={40} />
            <span className="hidden sm:inline">EBC Comfort</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-[var(--color-accent-2)]">{t('common.products')}</a>
            <a href="#how" className="hover:text-[var(--color-accent-2)]">{t('home.hero.cta_secondary')}</a>
            <a href="#chat" className="hover:text-[var(--color-accent-2)]">{t('chat.title')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle locale={locale} />
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto safe-x py-16 sm:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
          {/* Hero text card */}
          <div className="glass-card p-7 sm:p-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[var(--color-accent)]/12 text-[var(--color-accent-2)] mb-6">
              ✨ {t('home.hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              {t('home.hero.title_line_1')}
              <br />
              <em className="italic text-[var(--color-accent-2)] font-medium not-italic">
                {t('home.hero.title_line_2')}
              </em>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#order"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] transition-colors"
              >
                {t('home.hero.cta_primary')}
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                {t('home.hero.cta_secondary')}
              </a>
            </div>
          </div>

          {/* Hero video card */}
          <div className="glass-card p-2 relative">
            <div className="aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent-2)]/20 ring-1 ring-[var(--color-border)]">
              <video
                src="/brand/logo-luxus.mp4"
                poster="/brand/logo-luxus.png"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                aria-label="EBC Comfort logo animation"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto safe-x">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'heat', icon: '🌡️' },
              { key: 'battery', icon: '🔋' },
              { key: 'discreet', icon: '🤫' },
              { key: 'silicone', icon: '🌿' },
            ].map((f) => (
              <div key={f.key} className="glass-card p-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent-2)] text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{t(`home.features.${f.key}.title`)}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {t(`home.features.${f.key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — single big card */}
      <section id="how" className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto safe-x">
          <div className="glass-card p-7 sm:p-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">
              {t('home.how_it_works.title')}
            </h2>
            <ol className="space-y-4">
              {['on', 'choose', 'wear', 'charge'].map((s, idx) => (
                <li key={s} className="flex gap-4 items-start p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-accent)] text-white font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed pt-1">
                    {t(`home.how_it_works.steps.${s}`)}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-6 italic text-center">
              {t('home.how_it_works.note')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer — transparent strip, only cards are opaque */}
      <footer className="app-footer">
        <div className="max-w-6xl mx-auto safe-x py-10 space-y-4">
          <div className="glass-card p-6 sm:p-8">
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
              {t('legal.footer_disclaimer')}
            </p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-[var(--color-muted)]">
              © 2026 EBC Wellness · {locale.toUpperCase()}
            </p>
          </div>
        </div>
      </footer>

      <AiChatWidget locale={locale} />
    </div>
  );
}
