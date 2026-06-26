import { notFound } from 'next/navigation';
import { pageAlternates } from '@/lib/seo';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import { getPublicPagesDict } from '@/lib/i18n/public-pages';
import { faqLd } from '@/lib/seo-jsonld';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import('next').Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, '/gyik') };
}

export default async function FaqPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getPublicPagesDict(locale).gyik;

  return (
    <PublicShell locale={locale}>
      <JsonLd data={faqLd(dict.items.map((f) => ({ q: f.q, a: f.a.replace(/\*\*/g, '') })))} />
      <div className="max-w-3xl mx-auto safe-x py-12 sm:py-16 space-y-4">
        <div className="glass-card p-7 sm:p-10 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{dict.title}</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">
            {dict.intro}{' '}
            <a href="mailto:hello@ebc-wellness.eu" className="underline">
              {dict.intro_email_label}
            </a>
            .
          </p>
        </div>

        {dict.items.map((f, i) => (
          <details key={i} className="glass-card p-5">
            <summary className="cursor-pointer font-semibold text-base">{f.q}</summary>
            <p className="mt-3 text-sm leading-relaxed">
              {f.a.split('**').map((chunk, idx) =>
                idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : chunk
              )}
            </p>
          </details>
        ))}

        <div className="glass-card p-5 mt-6 text-xs text-[var(--color-muted)] italic text-center">
          {dict.disclaimer}
        </div>
      </div>
    </PublicShell>
  );
}
