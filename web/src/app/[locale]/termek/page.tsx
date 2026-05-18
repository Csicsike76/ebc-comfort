import { notFound } from 'next/navigation';
import { isValidLocale, Locale, FALLBACK_LOCALE } from '@/lib/i18n/config';
import { getDict, tt } from '@/lib/i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatMoneyCents } from '@/lib/admin/guard';
import { renderMarkdown } from '@/lib/markdown';
import PublicShell from '@/components/PublicShell';
import AddToCartButton from '@/components/AddToCartButton';

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

            <div className="mt-8">
              <AddToCartButton
                locale={locale}
                label={t('product.add_to_cart')}
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
              <p className="text-xs text-[var(--color-muted)] mt-3">
                ⓘ Pre-launch fázis. Stripe-konfiguráció finalizálás alatt — a fizetés a végén
                placeholder-üzemmódban lehet még; valós kártya-terhelés csak a launch-kor.
              </p>
            </div>

            <hr className="my-8 border-[var(--color-border)]" />

            <h2 className="font-bold text-lg mb-3">{t('product.specs')}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Spec label="Súly" value={`${product.weight_grams ?? '—'} g`} />
              <Spec
                label="Méret"
                value={dims.l ? `${dims.l}×${dims.w}×${dims.h} mm` : '120×70×30 mm'}
              />
              <Spec label="Garancia" value={`${product.warranty_months ?? 24} hó (EU 2019/771)`} />
              <Spec label="Hőfokozat" value="5 fokozat (50/55/60/65/70 °C)" />
              <Spec label="Hőmérséklet-pontosság" value="±3 °C" />
              <Spec label="Akkumulátor" value="8000 mAh Li-ion" />
              <Spec label="Üzemidő" value="~10 óra (alacsony fokozaton)" />
              <Spec label="Töltés" value="USB-C bemenet, ~3 óra" />
              <Spec label="Kimenet" value="1× USB (single port)" />
              <Spec label="Hőelem mérete" value="120×50 mm szilikon" />
              <Spec label="Kábel" value="60 cm fekete szilikon" />
              <Spec label="Rögzítés" value="Állítható derékpánt + csat" />
              <Spec label="Gél-betét" value="2 db cserélhető, öntapadós" />
              <Spec label="Védelem" value="Túlmelegedés auto-kikapcsolás" />
              <Spec label="Szín" value="Fekete" />
              <Spec label="Tanúsítvány" value="CE-LVD + CE-EMC + RoHS" />
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
