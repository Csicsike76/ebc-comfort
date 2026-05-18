import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

const ITEMS = [
  { key: 'kriszta', avatar: 'K' },
  { key: 'beata', avatar: 'B' },
  { key: 'zsofi', avatar: 'Z' },
] as const;

const PRE_LAUNCH_NOTICE: Partial<Record<Locale, string>> = {
  hu: 'Pre-launch demo. A vásárlói visszajelzéseket a 2026 Q3 launch után kezdjük gyűjteni.',
  en: 'Pre-launch demo. Real customer reviews will appear after the Q3 2026 launch.',
  de: 'Pre-Launch-Demo. Echte Kundenbewertungen erscheinen nach dem Launch im 3. Quartal 2026.',
  fr: 'Démo pré-lancement. Les vrais avis clients apparaîtront après le lancement T3 2026.',
  it: 'Demo pre-lancio. Le recensioni reali appariranno dopo il lancio Q3 2026.',
  es: 'Demo pre-lanzamiento. Las opiniones reales aparecerán tras el lanzamiento T3 2026.',
  pl: 'Demo przed startem. Prawdziwe opinie pojawią się po starcie Q3 2026.',
  ro: 'Demo pre-lansare. Recenziile reale vor apărea după lansarea T3 2026.',
  nl: 'Pre-launch demo. Echte beoordelingen verschijnen na de Q3 2026 launch.',
  pt: 'Demo pré-lançamento. Avaliações reais aparecerão após o lançamento Q3 2026.',
  cs: 'Předlaunchové demo. Skutečné recenze se objeví po spuštění Q3 2026.',
  sk: 'Predlaunchové demo. Skutočné recenzie sa zobrazia po spustení Q3 2026.',
  sv: 'Pre-launch demo. Riktiga omdömen visas efter lanseringen Q3 2026.',
  da: 'Pre-launch demo. Rigtige anmeldelser vises efter Q3 2026-lanceringen.',
  fi: 'Pre-launch demo. Aidot arvostelut näkyvät Q3 2026 lanseerauksen jälkeen.',
  bg: 'Демо преди старт. Реалните отзиви ще се появят след старта Q3 2026.',
  hr: 'Pre-launch demo. Pravi recenzije će se pojaviti nakon Q3 2026 launcha.',
  et: 'Eel-launchi demo. Pärisretsensioonid ilmuvad pärast Q3 2026 launchi.',
  el: 'Demo πριν την κυκλοφορία. Πραγματικές κριτικές θα εμφανιστούν μετά το λανσάρισμα Q3 2026.',
  ga: 'Demo réamh-sheoladh. Léirmheasanna fíor le feiceáil tar éis seoladh R3 2026.',
  lv: 'Pirms-launch demo. Reālas atsauksmes parādīsies pēc Q3 2026 launcha.',
  lt: 'Iki-launch demo. Tikros apžvalgos pasirodys po Q3 2026 launcho.',
  mt: 'Demo qabel il-launch. Recensjonijiet veri jidhru wara t-tnedija Q3 2026.',
  sl: 'Demo pred launchom. Prave ocene se pojavijo po Q3 2026 launchu.',
};

export default function Testimonials({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  const notice = PRE_LAUNCH_NOTICE[locale] ?? PRE_LAUNCH_NOTICE.en!;
  return (
    <section className="max-w-6xl mx-auto safe-x py-16 sm:py-20">
      <h2 className="text-center text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
        {t('home.testimonials.title')}
      </h2>
      <p className="text-center text-xs text-[var(--color-muted)] italic mb-8">
        {notice}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ITEMS.map((it) => (
          <div key={it.key} className="glass-card testimonial">
            <div className="testimonial-stars">★★★★★</div>
            <p className="text-[15px] leading-relaxed m-0 mb-4">
              „{t(`home.testimonials.items.${it.key}.quote`)}"
            </p>
            <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-muted)]">
              <span className="testimonial-avatar">{it.avatar}</span>
              <span>{t(`home.testimonials.items.${it.key}.author`)} · demo</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
