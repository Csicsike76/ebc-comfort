import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';
import { getUi } from '@/lib/i18n/ui-strings';
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

  const cartLabel = tt(getDict(locale), 'common.cart');
  const ui = getUi(locale);

  return (
    <PublicShell locale={locale}>
      <div className="max-w-4xl mx-auto safe-x py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">{cartLabel}</h1>
        {!stripeConfigured && (
          <div className="glass-card p-4 mb-6 border-l-4 border-amber-500 text-sm">
            ⚠️ <strong>{ui.cart_demo_note}</strong>
          </div>
        )}
        <CartView locale={locale} stripeConfigured={stripeConfigured} />
      </div>
    </PublicShell>
  );
}
