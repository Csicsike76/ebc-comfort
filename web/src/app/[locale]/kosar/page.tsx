import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import PublicShell from '@/components/PublicShell';
import CartView from '@/components/CartView';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes('PLACEHOLDER');

  return (
    <PublicShell locale={locale}>
      <div className="max-w-4xl mx-auto safe-x py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Kosár</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Add meg a szállítási adatokat, majd indítsd a fizetést.
        </p>
        {!stripeConfigured && (
          <div className="glass-card p-4 mb-6 border-l-4 border-amber-500 text-sm">
            ⚠️ <strong>Stripe placeholder-módban:</strong> a fizetés-folyamatot tesztelheted,
            de a rendelés a backend-en `pending` státuszban marad, és nincs valódi terhelés. Real
            kulcs cseréje után automatikusan élesedik.
          </div>
        )}
        <CartView locale={locale} stripeConfigured={stripeConfigured} />
      </div>
    </PublicShell>
  );
}
