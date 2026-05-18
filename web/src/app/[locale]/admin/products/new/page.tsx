import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/guard';
import ProductForm from '@/components/admin/ProductForm';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewProduct({ params }: Props) {
  const { locale: localeParam } = await params;
  const { locale } = await requireAdmin(localeParam);

  async function create(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa } = await requireAdmin(lp);

    const slug = String(formData.get('slug') ?? '').trim();
    const sku = String(formData.get('sku') ?? '').trim();
    const status = String(formData.get('status') ?? 'draft');
    const base_price_cents = parseInt(String(formData.get('base_price_cents') ?? '0'), 10);
    const currency = String(formData.get('currency') ?? 'EUR');
    const vat_rate_pct = parseFloat(String(formData.get('vat_rate_pct') ?? '27'));
    const weight_grams = formData.get('weight_grams') ? parseInt(String(formData.get('weight_grams')), 10) : null;

    if (!slug || !sku || !Number.isFinite(base_price_cents) || base_price_cents <= 0) {
      throw new Error('slug + sku + base_price_cents kötelező és > 0');
    }

    const { data, error } = await supa
      .from('products')
      .insert({ slug, sku, status, base_price_cents, currency, vat_rate_pct, weight_grams })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    redirect(`/${lp}/admin/products/${data.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto safe-x py-10">
      <h1 className="text-3xl font-bold mb-6">Új termék</h1>
      <ProductForm action={create} locale={locale} />
    </div>
  );
}
