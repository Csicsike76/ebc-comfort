import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutCancelled({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { order } = await searchParams;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  return (
    <PublicShell locale={locale}>
      <div className="max-w-3xl mx-auto safe-x py-16 sm:py-24 text-center">
        <div className="glass-card p-10 sm:p-14">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Fizetés megszakítva</h1>
          {order && (
            <p className="text-base mb-4">
              Rendelés-szám: <span className="font-mono">{order}</span> (függőben)
            </p>
          )}
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6">
            A fizetést megszakítottad vagy a kapcsolat megszakadt. A kosár tartalma megmaradt,
            visszamehetsz és megpróbálhatod újra.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`/${locale}/kosar`}
              className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Vissza a kosárhoz
            </a>
            <a
              href={`/${locale}/termek`}
              className="px-6 py-2.5 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
            >
              Termék-oldal
            </a>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
