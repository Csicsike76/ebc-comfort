import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import LegalDocView from '@/components/LegalDocView';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdatvedelemPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  return (
    <PublicShell locale={locale}>
      <LegalDocView slug="adatvedelem" locale={locale} />
    </PublicShell>
  );
}
