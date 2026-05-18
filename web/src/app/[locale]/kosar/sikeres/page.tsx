import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import CartClearOnMount from '@/components/CartClearOnMount';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; session_id?: string; placeholder?: string }>;
}

export default async function CheckoutSuccess({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { order, placeholder } = await searchParams;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  return (
    <PublicShell locale={locale}>
      <CartClearOnMount />
      <div className="max-w-3xl mx-auto safe-x py-16 sm:py-24 text-center">
        <div className="glass-card p-10 sm:p-14">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {placeholder ? 'Teszt-rendelés rögzítve' : 'Sikeres rendelés!'}
          </h1>
          {order && (
            <p className="text-base mb-6">
              Rendelés-szám: <span className="font-mono font-bold">{order}</span>
            </p>
          )}
          {placeholder ? (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6">
              A rendelést rögzítettük a backendben (status: <code>pending</code>). Mivel a
              Stripe-konfiguráció még placeholder-módban van, valódi terhelés NEM történt.
              Amint az élesítés megtörténik, ez a flow automatikusan kártya-fizetésre vált.
            </p>
          ) : (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6">
              Köszönjük a megrendelést! Visszaigazoló e-mailt küldünk a megadott címre. A
              rendelés állapotát a fiókodban követheted nyomon.
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`/${locale}`}
              className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Kezdőlap
            </a>
            <a
              href={`/${locale}/edukacio`}
              className="px-6 py-2.5 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
            >
              Edukáció
            </a>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
