import { notFound } from 'next/navigation';
import { pageAlternates } from '@/lib/seo';
import { isValidLocale, Locale, FALLBACK_LOCALE } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';
import { getUi } from '@/lib/i18n/ui-strings';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatMoneyCents } from '@/lib/admin/guard';
import { renderMarkdown } from '@/lib/markdown';
import PublicShell from '@/components/PublicShell';
import AddToCartButton from '@/components/AddToCartButton';
import { getPublicPagesDict } from '@/lib/i18n/public-pages';

interface Props {
  params: Promise<{ locale: string }>;
}

interface TranslationRow {
  locale: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
}

interface ImageRow {
  url: string;
  alt_text: Record<string, string> | null;
  display_order: number;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import('next').Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, '/termek') };
}

export default async function ProductPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);

  const pp = getPublicPagesDict(locale).termek;

  const supa = await getSupabaseServerClient();
  const { data: product } = await supa
    .from('products')
    .select('id, slug, sku, base_price_cents, currency, weight_grams, dimensions_mm, warranty_months, hs_code')
    .eq('slug', 'ebc-comfort')
    .single();

  if (!product) {
    return (
      <PublicShell locale={locale}>
        <div className="max-w-3xl mx-auto safe-x py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">{getUi(locale).product_unavailable}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            <a href={`/${locale}/tamogatas`} className="text-[var(--color-accent-2)] underline">
              {tt(getDict(locale), 'common.support')}
            </a>
          </p>
        </div>
      </PublicShell>
    );
  }

  const { data: translations } = await supa
    .from('product_translations')
    .select('locale, name, short_description, long_description')
    .eq('product_id', product.id);

  const trMap = new Map<string, TranslationRow>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    trMap.set(t.locale, t);
  }
  const tr = trMap.get(locale) ?? trMap.get(FALLBACK_LOCALE) ?? trMap.get('hu');

  const { data: images } = await supa
    .from('product_images')
    .select('url, alt_text, display_order')
    .eq('product_id', product.id)
    .order('display_order');

  const dims = (product.dimensions_mm ?? {}) as { l?: number; w?: number; h?: number };

  return (
    <PublicShell locale={locale}>
      <article className="max-w-6xl mx-auto safe-x py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="glass-card p-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent-2)]/20">
              {(images?.[0] as ImageRow | undefined)?.url ? (
                <picture>
                  <img
                    src={(images?.[0] as ImageRow).url}
                    alt={
                      (images?.[0] as ImageRow).alt_text?.[locale] ??
                      tr?.name ??
                      'EBC Comfort'
                    }
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : (
                <video
                  src="/brand/logo-luxus.mp4"
                  poster="/brand/logo-luxus.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="EBC Comfort"
                />
              )}
            </div>
            {(images ?? []).length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(images as ImageRow[]).slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]"
                  >
                    <picture>
                      <img
                        src={img.url}
                        alt={img.alt_text?.[locale] ?? ''}
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-7 sm:p-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-[var(--color-accent)]/12 text-[var(--color-accent-2)] mb-4">
              SKU · {product.sku}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {tr?.name ?? 'EBC Comfort'}
            </h1>
            {tr?.short_description && (
              <p className="mt-4 text-base text-[var(--color-muted)] leading-relaxed">
                {tr.short_description}
              </p>
            )}

            <div className="mt-6 text-4xl font-bold">
              {formatMoneyCents(product.base_price_cents, product.currency)}
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              ÁFA-val · szállítás kalkulálva a kosárban
            </p>

            <div className="mt-8">
              <AddToCartButton
                locale={locale}
                label={pp.add_to_cart}
                item={{
                  product_id: product.id,
                  sku: product.sku,
                  name: tr?.name ?? 'EBC Comfort',
                  unit_price_cents: product.base_price_cents,
                  currency: product.currency,
                  image_url:
                    (images?.[0] as ImageRow | undefined)?.url ?? '/brand/logo-luxus.png',
                }}
              />
              <p className="text-xs text-[var(--color-muted)] mt-3">ⓘ {pp.pre_launch_note}</p>
            </div>

            <hr className="my-8 border-[var(--color-border)]" />

            <h2 className="font-bold text-lg mb-3">{pp.specs_title}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Spec label={pp.spec_labels.weight} value={`${product.weight_grams ?? '—'} g`} />
              <Spec
                label={pp.spec_labels.dimensions}
                value={dims.l ? `${dims.l}×${dims.w}×${dims.h} mm` : '120×70×30 mm'}
              />
              <Spec
                label={pp.spec_labels.warranty}
                value={`${product.warranty_months ?? 24} hó (EU 2019/771)`}
              />
              <Spec label={pp.spec_labels.temp_levels} value="50 / 55 / 60 / 65 / 70 °C" />
              <Spec label={pp.spec_labels.temp_accuracy} value="±3 °C" />
              <Spec label={pp.spec_labels.battery} value="8000 mAh Li-ion" />
              <Spec label={pp.spec_labels.runtime} value="~10 h @ 50 °C" />
              <Spec label={pp.spec_labels.charging} value="USB-C, ~3 h" />
              <Spec label={pp.spec_labels.output} value="1× USB" />
              <Spec label={pp.spec_labels.heating_element} value="120×50 mm silicone" />
              <Spec label={pp.spec_labels.cable} value="60 cm silicone, black" />
              <Spec label={pp.spec_labels.strap} value="Adjustable + buckle" />
              <Spec label={pp.spec_labels.gel_pad} value="2× replaceable" />
              <Spec label={pp.spec_labels.protection} value="Auto overheat shutdown" />
              <Spec label={pp.spec_labels.color} value="Black" />
              <Spec label={pp.spec_labels.cert} value="CE-LVD + CE-EMC + RoHS" />
            </dl>

            {tr?.long_description && (
              <>
                <hr className="my-8 border-[var(--color-border)]" />
                <h2 className="font-bold text-lg mb-3">{pp.description_title}</h2>
                <div className="text-sm">{renderMarkdown(tr.long_description)}</div>
              </>
            )}
          </div>
        </div>

        <section className="glass-card p-6 sm:p-10 mt-10">
          <h2 className="font-bold text-xl mb-4">{pp.benefits_title}</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {pp.benefits.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent-2)]">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)] mt-6 italic">{pp.medical_disclaimer}</p>
        </section>
      </article>
    </PublicShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
