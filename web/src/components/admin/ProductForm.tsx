import { Locale } from '@/lib/i18n/config';

interface ProductInitial {
  slug?: string;
  sku?: string;
  status?: string;
  base_price_cents?: number;
  currency?: string;
  vat_rate_pct?: number;
  weight_grams?: number | null;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  locale: Locale;
  initial?: ProductInitial;
  submitLabel?: string;
}

export default function ProductForm({ action, initial = {}, submitLabel = 'Mentés' }: Props) {
  return (
    <form action={action} className="glass-card p-6 space-y-4">
      <Field label="Slug (URL)" name="slug" required defaultValue={initial.slug ?? ''} hint="pl. ebc-comfort" />
      <Field label="SKU (cikkszám)" name="sku" required defaultValue={initial.sku ?? ''} hint="pl. EBC-100-EU" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Státusz"
          name="status"
          defaultValue={initial.status ?? 'draft'}
          options={[
            { value: 'draft', label: 'Vázlat' },
            { value: 'active', label: 'Aktív' },
            { value: 'paused', label: 'Szüneteltetett' },
            { value: 'archived', label: 'Archivált' },
          ]}
        />
        <Field
          label="Pénznem"
          name="currency"
          defaultValue={initial.currency ?? 'EUR'}
          hint="ISO 4217 kód"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Bruttó alapár (cent)"
          name="base_price_cents"
          type="number"
          required
          defaultValue={String(initial.base_price_cents ?? '10000')}
          hint="100 EUR = 10000"
        />
        <Field
          label="ÁFA %"
          name="vat_rate_pct"
          type="number"
          step="0.01"
          defaultValue={String(initial.vat_rate_pct ?? '27.00')}
        />
      </div>
      <Field
        label="Súly (gramm)"
        name="weight_grams"
        type="number"
        defaultValue={initial.weight_grams != null ? String(initial.weight_grams) : ''}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  hint,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        step={step}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      />
      {hint && <span className="block text-xs text-[var(--color-muted)] mt-1">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
