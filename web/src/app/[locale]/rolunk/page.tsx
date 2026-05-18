import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import { getPublicPagesDict } from '@/lib/i18n/public-pages';

interface Props {
  params: Promise<{ locale: string }>;
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split('**');
  return parts.map((chunk, idx) =>
    idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : <span key={idx}>{chunk}</span>,
  );
}

export default async function AboutPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getPublicPagesDict(locale).rolunk;

  return (
    <PublicShell locale={locale}>
      <article className="max-w-3xl mx-auto safe-x py-12 sm:py-16 space-y-8">
        <header className="glass-card p-7 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{dict.title}</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">{dict.intro}</p>
        </header>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">{dict.story_title}</h2>
          <p>{dict.story_p1}</p>
          <p>{renderBold(dict.story_p2)}</p>
        </section>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">{dict.team_title}</h2>
          <ul className="space-y-3">
            <li>{renderBold(dict.team_ildi)}</li>
            <li>{renderBold(dict.team_zsolt)}</li>
          </ul>
        </section>

        <section className="glass-card p-7 sm:p-10 space-y-4">
          <h2 className="text-2xl font-bold">{dict.promise_title}</h2>
          <ul className="space-y-3">
            <li>
              <strong>{dict.promise_discretion_h}</strong> — {dict.promise_discretion}
            </li>
            <li>
              <strong>{dict.promise_transparency_h}</strong> — {dict.promise_transparency}
            </li>
            <li>
              <strong>{dict.promise_ngo_h}</strong> — {dict.promise_ngo}
            </li>
            <li>
              <strong>{dict.promise_eu_h}</strong> — {dict.promise_eu}
            </li>
          </ul>
        </section>

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-4">{dict.contact_title}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              📧{' '}
              <span className="text-[var(--color-muted)]">{dict.contact_email_label}:</span>{' '}
              <a href="mailto:hello@ebc-wellness.eu" className="underline">
                hello@ebc-wellness.eu
              </a>
            </li>
            <li>
              🛟{' '}
              <span className="text-[var(--color-muted)]">{dict.contact_support_label}:</span>{' '}
              <a href={`/${locale}/tamogatas`} className="underline">
                /{locale}/tamogatas
              </a>
            </li>
            <li>💬 {dict.contact_ai_label}</li>
            <li>🏢 {dict.contact_hq_label}</li>
          </ul>
        </section>

        <p className="text-xs text-[var(--color-muted)] italic text-center">
          {dict.footer_disclaimer}
        </p>
      </article>
    </PublicShell>
  );
}
