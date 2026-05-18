'use client';
import { useState, useTransition } from 'react';
import { useCart } from '@/lib/cart/CartContext';
import { Locale } from '@/lib/i18n/config';
import { bcp47 } from '@/lib/format';
import { getCartDict } from '@/lib/i18n/cart';
import {
  getVatRate,
  vatCentsFromNet,
  shippingCents as computeShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
  DEFAULT_COUNTRY,
} from '@/lib/vat';

interface Props {
  locale: Locale;
  stripeConfigured: boolean;
}

// EU-27 country list (ISO 3166-1 alpha-2) — extended from the original 15 to
// cover all 27 member states so checkout doesn't reject buyers from BG/HR/
// CY/EE/EL/IE/LV/LT/LU/MT/SI/UK.
const COUNTRIES: readonly string[] = [
  'HU', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
  'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
];

export default function CartView({ locale, stripeConfigured }: Props) {
  const { items, subtotalCents, currency, setQuantity, remove, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const dict = getCartDict(locale);

  const shippingCents = computeShipping(subtotalCents, items.length);
  const vatRate = getVatRate(country);
  const vatCents = vatCentsFromNet(subtotalCents + shippingCents, vatRate);
  const totalCents = subtotalCents + shippingCents + vatCents;

  function formatMoney(cents: number) {
    return new Intl.NumberFormat(bcp47(locale), {
      style: 'currency',
      currency,
    }).format(cents / 100);
  }

  function handleCheckout(formData: FormData) {
    setError(null);
    const payload = {
      locale,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      shipping_address: {
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
        street: String(formData.get('street') ?? '').trim(),
        city: String(formData.get('city') ?? '').trim(),
        postcode: String(formData.get('postcode') ?? '').trim(),
        country: String(formData.get('country') ?? DEFAULT_COUNTRY).trim(),
      },
    };

    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? dict.unknown_error);
          return;
        }
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.placeholder_redirect) {
          window.location.href = `/${locale}/kosar/sikeres?order=${data.order_number ?? ''}&placeholder=1`;
          return;
        }
        setError(dict.no_checkout_url);
      } catch (e) {
        setError(e instanceof Error ? e.message : dict.network_error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-base mb-4">{dict.empty_cart}</p>
        <a
          href={`/${locale}/termek`}
          className="inline-block px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          {dict.view_product}
        </a>
      </div>
    );
  }

  const freeShippingHint = dict.free_shipping_hint.replace(
    '{threshold}',
    formatMoney(FREE_SHIPPING_THRESHOLD_CENTS),
  );
  const vatPctLabel = (vatRate * 100).toFixed(vatRate * 10 % 1 === 0 ? 0 : 1);

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <section className="space-y-4">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent)]/5 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">{dict.product_col}</th>
                <th className="px-4 py-3 font-semibold text-center">{dict.qty_col}</th>
                <th className="px-4 py-3 font-semibold text-right">{dict.price_col}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.product_id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-xs text-[var(--color-muted)] font-mono">{i.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center border border-[var(--color-border)] rounded-full">
                      <button
                        type="button"
                        onClick={() => setQuantity(i.product_id, i.quantity - 1)}
                        className="w-11 h-11 hover:bg-[var(--color-accent)]/10 rounded-l-full"
                        aria-label="−"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-mono">{i.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(i.product_id, i.quantity + 1)}
                        className="w-11 h-11 hover:bg-[var(--color-accent)]/10 rounded-r-full"
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMoney(i.unit_price_cents * i.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(i.product_id)}
                      className="text-xs text-red-600 hover:underline px-3 py-2"
                      aria-label={`${dict.remove_label}: ${i.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          action={handleCheckout}
          className="glass-card p-6 space-y-4"
          aria-busy={pending}
        >
          <h2 className="text-lg font-bold">{dict.shipping_address}</h2>
          <Field label={dict.full_name} name="name" required dict={dict} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={dict.email} name="email" type="email" required dict={dict} />
            <Field label={dict.phone} name="phone" type="tel" dict={dict} />
          </div>
          <Field label={dict.street} name="street" required dict={dict} />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label={dict.postcode} name="postcode" required dict={dict} />
            <Field label={dict.city} name="city" required dict={dict} />
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                {dict.country} <span className="text-red-500">{dict.required}</span>
              </span>
              <select
                name="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-700 text-sm">{error}</div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={clear}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10"
            >
              {dict.clear_cart}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-7 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50"
            >
              {pending
                ? dict.in_progress
                : `${stripeConfigured ? dict.pay : dict.test_order} → ${formatMoney(totalCents)}`}
            </button>
          </div>
        </form>
      </section>

      <aside className="glass-card p-6 h-fit">
        <h2 className="text-lg font-bold mb-3">{dict.total}</h2>
        <Row label={dict.subtotal} value={formatMoney(subtotalCents)} />
        <Row
          label={dict.shipping}
          value={shippingCents === 0 ? dict.shipping_free : formatMoney(shippingCents)}
        />
        <Row label={`${dict.vat} (${vatPctLabel}% · ${country})`} value={formatMoney(vatCents)} />
        <hr className="my-3 border-[var(--color-border)]" />
        <Row label={dict.total} value={formatMoney(totalCents)} bold />
        {shippingCents > 0 && (
          <p className="text-xs text-[var(--color-accent-2)] mt-3">{freeShippingHint}</p>
        )}
        <p className="text-xs text-[var(--color-muted)] mt-4">{dict.stripe_disclaimer}</p>
      </aside>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  dict: { required: string };
}

function Field({ label, name, type = 'text', required, dict }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
        {required && <span className="text-red-500"> {dict.required}</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-bold text-base' : ''}`}>
      <span className={bold ? '' : 'text-[var(--color-muted)]'}>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
