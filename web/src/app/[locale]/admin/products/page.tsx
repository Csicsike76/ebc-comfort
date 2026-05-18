import Link from 'next/link';
import { requireAdmin, formatMoneyCents, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
}

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  status: string;
  base_price_cents: number;
  currency: string;
  vat_rate_pct: number;
  updated_at: string;
}

interface TranslationRow {
  product_id: string;
  locale: string;
  name: string;
}

export default async function AdminProducts({ params }: Props) {
  const { locale: localeParam } = await params;
  const { locale, supa } = await requireAdmin(localeParam);

  const { data: products, error } = await supa
    .from('products')
    .select('id, slug, sku, status, base_price_cents, currency, vat_rate_pct, updated_at')
    .order('updated_at', { ascending: false });

  const ids = (products ?? []).map((p: ProductRow) => p.id);
  const { data: translations } = ids.length
    ? await supa
        .from('product_translations')
        .select('product_id, locale, name')
        .in('product_id', ids)
    : { data: [] };

  const nameByProduct = new Map<string, string>();
  for (const t of (translations ?? []) as TranslationRow[]) {
    if (t.locale === locale) nameByProduct.set(t.product_id, t.name);
  }
  for (const t of (translations ?? []) as TranslationRow[]) {
    if (!nameByProduct.has(t.product_id) && (t.locale === 'hu' || t.locale === 'en')) {
      nameByProduct.set(t.product_id, t.name);
    }
  }

  return (
    <div className="max-w-7xl mx-auto safe-x py-10">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Termékek</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {(products ?? []).length} termék · katalógus + ár + státusz
          </p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          + Új termék
        </Link>
      </div>

      {error && (
        <div className="glass-card p-4 mb-4 text-sm text-red-600">
          DB hiba: {error.message}
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent)]/5 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Név ({locale})</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Státusz</th>
              <th className="px-4 py-3 font-semibold text-right">Ár</th>
              <th className="px-4 py-3 font-semibold text-right">ÁFA</th>
              <th className="px-4 py-3 font-semibold">Frissítve</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: ProductRow) => (
              <tr key={p.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">
                  {nameByProduct.get(p.id) ?? <em className="text-[var(--color-muted)]">— nincs név —</em>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={p.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMoneyCents(p.base_price_cents, p.currency)}
                </td>
                <td className="px-4 py-3 text-right">{p.vat_rate_pct}%</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(p.updated_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/${locale}/admin/products/${p.id}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Szerkeszt →
                  </Link>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Még nincs termék.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-500/15 text-green-700 dark:text-green-300',
    draft: 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
    paused: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    archived: 'bg-red-500/15 text-red-700 dark:text-red-300',
  };
  const cls = map[value] ?? 'bg-gray-500/15';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{value}</span>;
}
