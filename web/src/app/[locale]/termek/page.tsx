import { notFound } from 'next/navigation';
import { isValidLocale, Locale, FALLBACK_LOCALE } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatMoneyCents } from '@/lib/admin/guard';
import { renderMarkdown } from '@/lib/markdown';
import PublicShell from '@/components/PublicShell';

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

export default async function ProductPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);

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
          <h1 className="text-2xl font-bold mb-3">Termék még nem elérhető</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Az EBC Comfort hamarosan megrendelhető lesz. Kérj értesítést a Támogatás oldalon.
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

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="px-7 py-3.5 rounded-full text-sm font-semibold bg-[var(--color-accent)] text-white opacity-50 cursor-not-allowed"
                title="Hamarosan — Stripe integráció folyamatban"
              >
                🛒 {t('product.add_to_cart')} (hamarosan)
              </button>
              <a
                href={`/${locale}/tamogatas`}
                className="px-7 py-3.5 rounded-full text-sm font-semibold border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                Értesíts a launch-kor
              </a>
            </div>

            <hr className="my-8 border-[var(--color-border)]" />

            <h2 className="font-bold text-lg mb-3">{t('product.specs')}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Spec label="Súly" value={`${product.weight_grams ?? '—'} g`} />
              <Spec
                label="Méret"
                value={
                  dims.l ? `${dims.l}×${dims.w}×${dims.h} mm` : '—'
                }
              />
              <Spec label="Garancia" value={`${product.warranty_months ?? 12} hó`} />
              <Spec label="Hőfokozat" value="5 (50-70 °C)" />
              <Spec label="Akkumulátor" value="8000 mAh Li-ion" />
              <Spec label="Töltés" value="USB-C, ~3 óra" />
            </dl>

            {tr?.long_description && (
              <>
                <hr className="my-8 border-[var(--color-border)]" />
                <h2 className="font-bold text-lg mb-3">Leírás</h2>
                <div className="text-sm">{renderMarkdown(tr.long_description)}</div>
              </>
            )}
          </div>
        </div>

        <section className="glass-card p-6 sm:p-10 mt-10">
          <h2 className="font-bold text-xl mb-4">Mire jó?</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              'Alhasi komfort-érzés természetes hőterápiával',
              'Diszkrét — fehérnemű alatt láthatatlan',
              'Csendes — munkahelyen vagy utazás közben sem hallható',
              'Cserélhető szilikon felület — könnyen tisztítható',
              'Túlmelegedés-védelem — biztonságos folyamatos viselet',
              'USB-C tölthető — gyors, modern',
            ].map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent-2)]">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)] mt-6 italic">
            EBC Comfort wellness-eszköz, NEM orvosi eszköz. Egészségügyi panasz esetén keress fel
            szakorvost. 18+ felhasználóknak ajánlott.
          </p>
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
