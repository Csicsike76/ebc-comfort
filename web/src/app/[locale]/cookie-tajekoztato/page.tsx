import { notFound } from 'next/navigation';
import { pageAlternates } from '@/lib/seo';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import LegalDocView from '@/components/LegalDocView';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import('next').Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, '/cookie-tajekoztato') };
}

export default async function CookiePage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  return (
    <PublicShell locale={locale}>
      <LegalDocView slug="cookie-tajekoztato" locale={locale} />
    </PublicShell>
  );
}
