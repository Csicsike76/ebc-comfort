import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

const ITEMS = [
  { key: 'kriszta', avatar: 'K' },
  { key: 'beata', avatar: 'B' },
  { key: 'zsofi', avatar: 'Z' },
] as const;

export default function Testimonials({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  return (
    <section className="max-w-6xl mx-auto safe-x py-16 sm:py-20">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-10 tracking-tight">
        {t('home.testimonials.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ITEMS.map((it) => (
          <div key={it.key} className="glass-card testimonial">
            <div className="testimonial-stars">★★★★★</div>
            <p className="text-[15px] leading-relaxed m-0 mb-4">
              „{t(`home.testimonials.items.${it.key}.quote`)}"
            </p>
            <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-muted)]">
              <span className="testimonial-avatar">{it.avatar}</span>
              <span>{t(`home.testimonials.items.${it.key}.author`)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
