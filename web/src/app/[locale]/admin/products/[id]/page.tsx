import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import ProductForm from '@/components/admin/ProductForm';
import { revalidatePath } from 'next/cache';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

interface TranslationRow {
  locale: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
}

export default async function EditProduct({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: product } = await supa
    .from('products')
    .select('id, slug, sku, status, base_price_cents, currency, vat_rate_pct, weight_grams, updated_at')
    .eq('id', id)
    .single();
  if (!product) notFound();

  const { data: translations } = await supa
    .from('product_translations')
    .select('locale, name, short_description, long_description')
    .eq('product_id', id);

  const translationsByLocale = new Map<string, TranslationRow>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    translationsByLocale.set(t.locale, t);
  }

  async function updateCore(formData: FormData) {
    'use server';
    const { locale: lp, id: pid } = await params;
    const { supa: s } = await requireAdmin(lp);
    const update = {
      slug: String(formData.get('slug') ?? '').trim(),
      sku: String(formData.get('sku') ?? '').trim(),
      status: String(formData.get('status') ?? 'draft'),
      base_price_cents: parseInt(String(formData.get('base_price_cents') ?? '0'), 10),
      currency: String(formData.get('currency') ?? 'EUR'),
      vat_rate_pct: parseFloat(String(formData.get('vat_rate_pct') ?? '27')),
      weight_grams: formData.get('weight_grams')
        ? parseInt(String(formData.get('weight_grams')), 10)
        : null,
    };
    const { error } = await s.from('products').update(update).eq('id', pid);
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/products/${pid}`);
  }

  async function upsertTranslation(formData: FormData) {
    'use server';
    const { locale: lp, id: pid } = await params;
    const { supa: s } = await requireAdmin(lp);
    const trLocale = String(formData.get('tr_locale') ?? '').trim();
    if (!trLocale) throw new Error('locale missing');
    const row = {
      product_id: pid,
      locale: trLocale,
      name: String(formData.get('name') ?? '').trim(),
      short_description: String(formData.get('short_description') ?? '') || null,
      long_description: String(formData.get('long_description') ?? '') || null,
    };
    if (!row.name) throw new Error('name kötelező');
    const { error } = await s.from('product_translations').upsert(row);
    if (error) throw new Error(error.message);
    revalidatePath(`/${lp}/admin/products/${pid}`);
  }

  async function deleteProduct() {
    'use server';
    const { locale: lp, id: pid } = await params;
    const { supa: s } = await requireAdmin(lp);
    const { error } = await s.from('products').delete().eq('id', pid);
    if (error) throw new Error(error.message);
    redirect(`/${lp}/admin/products`);
  }

  return (
    <div className="max-w-5xl mx-auto safe-x py-10 space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link
            href={`/${locale}/admin/products`}
            className="text-xs text-[var(--color-muted)] hover:underline"
          >
            ← Termékek
          </Link>
          <h1 className="text-2xl font-bold">{product.sku}</h1>
          <p className="text-xs text-[var(--color-muted)]">
            Frissítve: {formatDateTime(product.updated_at)}
          </p>
        </div>
        <form action={deleteProduct}>
          <button
            type="submit"
            className="px-4 py-2 rounded-full border border-red-500 text-red-600 text-sm hover:bg-red-500/10"
          >
            Törlés
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">Alap-adatok</h2>
        <ProductForm action={updateCore} locale={locale} initial={product} submitLabel="Frissítés" />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Fordítások (15 EU nyelv)</h2>
        <div className="space-y-3">
          {SUPPORTED_LOCALES.map((loc) => {
            const tr = translationsByLocale.get(loc);
            return (
              <details
                key={loc}
                open={loc === 'hu' || loc === locale}
                className="glass-card p-4"
              >
                <summary className="cursor-pointer font-semibold flex items-center justify-between">
                  <span>
                    {loc.toUpperCase()} · {tr?.name ?? <em className="text-[var(--color-muted)]">— üres —</em>}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tr ? 'bg-green-500/15 text-green-700' : 'bg-gray-500/15 text-gray-600'
                    }`}
                  >
                    {tr ? 'kész' : 'hiányzik'}
                  </span>
                </summary>
                <form action={upsertTranslation} className="mt-3 space-y-3">
                  <input type="hidden" name="tr_locale" value={loc} />
                  <FieldRow label="Név" name="name" required defaultValue={tr?.name ?? ''} />
                  <FieldRow
                    label="Rövid leírás"
                    name="short_description"
                    defaultValue={tr?.short_description ?? ''}
                  />
                  <TextAreaRow
                    label="Hosszú leírás (markdown)"
                    name="long_description"
                    defaultValue={tr?.long_description ?? ''}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[var(--color-accent)] text-white text-sm"
                    >
                      Mentés ({loc})
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FieldRow({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type="text"
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      />
    </label>
  );
}

function TextAreaRow({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={5}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono"
      />
    </label>
  );
}
