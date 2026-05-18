import Counter from '@/components/Counter';
import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

const ITEM_KEYS = ['item', 'accu', 'silicone', 'packaging', 'refund', 'warranty'] as const;

interface Props {
  locale: Locale;
  href?: string;
}

export default function PricingCard({ locale, href }: Props) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  // Default routes to product page where AddToCartButton + checkout flow lives.
  const orderHref = href ?? `/${locale}/termek`;
  return (
    <div className="glass-card pricing-card">
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[var(--color-accent)]/15 text-[var(--color-accent-2)]">
        ✨ {t('home.pricing.badge')}
      </span>
      <div className="pricing-price">
        <Counter
          from={999}
          target={100}
          durationMs={1600}
          locale={locale === 'hu' ? 'hu-HU' : 'en-US'}
        /> €
      </div>
      <p className="text-sm text-[var(--color-muted)]">{t('home.pricing.subline')}</p>
      <ul className="pricing-includes">
        {ITEM_KEYS.map((k) => (
          <li key={k}>
            <span className="tick">✓</span>
            <span>{t(`home.pricing.includes.${k}`)}</span>
          </li>
        ))}
      </ul>
      <a
        href={orderHref}
        className="btn-cta-pulse inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] transition-colors"
      >
        {t('home.pricing.cta')}
      </a>
    </div>
  );
}
