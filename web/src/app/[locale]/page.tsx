import { getDict, tt } from '@/lib/i18n';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import AiChatWidget from '@/components/AiChatWidget';
import BrandLogo from '@/components/BrandLogo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import CartIndicator from '@/components/CartIndicator';
import CookieConsent from '@/components/CookieConsent';
import CookieSettingsLink from '@/components/CookieSettingsLink';
import MarketingPixels from '@/components/MarketingPixels';
import UtmTracker from '@/components/UtmTracker';
import { CartProvider } from '@/lib/cart/CartContext';
import FadeIn from '@/components/FadeIn';
import StickyCta from '@/components/StickyCta';
import PricingCard from '@/components/PricingCard';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import TrustBadges from '@/components/TrustBadges';
import BrandOrnament from '@/components/BrandOrnament';

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
    <CartProvider>
      <MarketingPixels />
      <UtmTracker />

      <div className="flex flex-col min-h-screen">
        {/* Header */}
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
              <a href={`/${locale}/gyik`} className="hover:text-[var(--color-accent-2)]">GY.I.K.</a>
            </nav>
            <div className="flex items-center gap-2">
              <CartIndicator locale={locale} />
              <ThemeToggle locale={locale} />
              <LocaleSwitcher currentLocale={locale} />
            </div>
          </div>
        </header>

        {/* Hero — circular card centered over the globe bg */}
        <section id="hero" className="py-16 sm:py-20 grid place-items-center">
          <div className="max-w-6xl mx-auto safe-x w-full grid place-items-center">
            <div className="glass-card hero-card hero-card-circle">
              <BrandOrnament position="top-right" size={72} />
              <BrandOrnament position="bottom-left" size={48} />
              <span className="inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[var(--color-accent)]/14 text-[var(--color-accent-2)] mb-2">
                ✨ {t('home.hero.badge')}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight m-0 text-balance">
                {t('home.hero.title_line_1')}
                <br />
                <em className="not-italic font-medium text-[var(--color-accent-2)]">
                  {t('home.hero.title_line_2')}
                </em>
              </h1>
              <p className="mt-4 text-base sm:text-[17px] text-[var(--color-muted)] leading-relaxed max-w-[46ch]">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <a
                  href={`/${locale}/termek`}
                  className="btn-cta-pulse inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] transition-colors"
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
          </div>
        </section>

        {/* Features */}
        <FadeIn as="section" id="features" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto safe-x">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'heat', icon: '🌡️', ornament: false },
                { key: 'battery', icon: '🔋', ornament: false },
                { key: 'discreet', icon: '🤫', ornament: false },
                { key: 'silicone', icon: '', ornament: true },
              ].map((f) => (
                <div key={f.key} className="glass-card feature">
                  {f.ornament ? (
                    <BrandOrnament size={56} />
                  ) : (
                    <div className="feature-icon">{f.icon}</div>
                  )}
                  <h3 className="font-bold text-base mb-2 mt-2">{t(`home.features.${f.key}.title`)}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed m-0">
                    {t(`home.features.${f.key}.body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* How it works */}
        <FadeIn as="section" id="how" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto safe-x">
            <div className="glass-card how-wrap">
              <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-10">
                {t('home.how_it_works.title')}
              </h2>
              <ol className="list-none p-0 m-0 grid gap-3.5">
                {['on', 'choose', 'wear', 'charge'].map((s, idx) => (
                  <li key={s} className="how-step">
                    <span className="step-num">{idx + 1}</span>
                    <p className="m-0 leading-relaxed text-sm sm:text-base">
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
        </FadeIn>

        {/* Pricing */}
        <FadeIn as="section" id="pricing" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto safe-x">
            <PricingCard locale={locale} href="#order" />
          </div>
        </FadeIn>

        {/* Testimonials */}
        <FadeIn as="section" id="testimonials">
          <Testimonials locale={locale} />
        </FadeIn>

        {/* FAQ */}
        <FadeIn as="section">
          <Faq locale={locale} />
        </FadeIn>

        {/* Footer */}
        <footer className="app-footer">
          <div className="max-w-6xl mx-auto safe-x py-10 space-y-4">
            <TrustBadges locale={locale} />
            <div className="glass-card p-6 sm:p-8">
              <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed text-center m-0">
                {t('legal.footer_disclaimer')}
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-[var(--color-muted)] flex flex-wrap justify-center gap-x-3 gap-y-1">
                <span>© 2026 EBC Wellness · {locale.toUpperCase()}</span>
                <a href={`/${locale}/aszf`} className="hover:underline">ÁSZF</a>
                <a href={`/${locale}/adatvedelem`} className="hover:underline">Adatvédelem</a>
                <a href={`/${locale}/cookie-tajekoztato`} className="hover:underline">Cookie</a>
                <a href={`/${locale}/gyik`} className="hover:underline">GY.I.K.</a>
                <a href={`/${locale}/rolunk`} className="hover:underline">{t('common.about')}</a>
                <CookieSettingsLink locale={locale} />
              </p>
            </div>
          </div>
        </footer>

        <AiChatWidget locale={locale} />
        <CookieConsent locale={locale} />
        <StickyCta
          heroSelector="#hero"
          text={`EBC Comfort · 100 €`}
          ctaLabel={t('home.hero.cta_primary')}
          href={`/${locale}/termek`}
        />
      </div>
    </CartProvider>
  );
}
