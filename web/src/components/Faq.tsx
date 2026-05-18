import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

const ITEMS = ['charge', 'sleep', 'washable', 'wellness', 'refund'] as const;

export default function Faq({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  return (
    <section id="faq" className="max-w-3xl mx-auto safe-x py-16 sm:py-20">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-10 tracking-tight">
        {t('home.faq.title')}
      </h2>
      <div className="grid gap-3">
        {ITEMS.map((k) => (
          <details key={k} className="glass-card faq-item">
            <summary className="faq-summary">{t(`home.faq.items.${k}.q`)}</summary>
            <div className="faq-body">{t(`home.faq.items.${k}.a`)}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
