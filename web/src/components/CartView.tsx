'use client';
import { useState, useTransition } from 'react';
import { useCart } from '@/lib/cart/CartContext';
import { Locale } from '@/lib/i18n/config';
import { bcp47 } from '@/lib/format';

interface Props {
  locale: Locale;
  stripeConfigured: boolean;
}

const SHIPPING_CENTS = 1500; // €15 flat HU/EU
const VAT_RATE = 0.27;

export default function CartView({ locale, stripeConfigured }: Props) {
  const { items, subtotalCents, currency, setQuantity, remove, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shippingCents = items.length === 0 ? 0 : SHIPPING_CENTS;
  const vatCents = Math.round(subtotalCents * VAT_RATE);
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
        country: String(formData.get('country') ?? 'HU').trim(),
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
          setError(data.error ?? 'Ismeretlen hiba');
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
        setError('Nincs visszaadott checkout URL.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Hálózati hiba');
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-base mb-4">A kosár üres.</p>
        <a
          href={`/${locale}/termek`}
          className="inline-block px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          Termék megnézése →
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <section className="space-y-4">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent)]/5 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Termék</th>
                <th className="px-4 py-3 font-semibold text-center">Mennyiség</th>
                <th className="px-4 py-3 font-semibold text-right">Ár</th>
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
                        className="w-8 h-8 hover:bg-[var(--color-accent)]/10 rounded-l-full"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-mono">{i.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(i.product_id, i.quantity + 1)}
                        className="w-8 h-8 hover:bg-[var(--color-accent)]/10 rounded-r-full"
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
                      className="text-xs text-red-600 hover:underline"
                      aria-label={`Eltávolít: ${i.name}`}
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
          <h2 className="text-lg font-bold">Szállítási cím</h2>
          <Field label="Teljes név" name="name" required />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email" name="email" type="email" required />
            <Field label="Telefon" name="phone" type="tel" />
          </div>
          <Field label="Utca + házszám" name="street" required />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Irányítószám" name="postcode" required />
            <Field label="Város" name="city" required />
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Ország <span className="text-red-500">*</span>
              </span>
              <select
                name="country"
                required
                defaultValue="HU"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              >
                {['HU','RO','DE','AT','SK','CZ','PL','IT','FR','ES','NL','PT','SE','DK','FI'].map((c) => (
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
              Kosár ürítése
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-7 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50"
            >
              {pending ? 'Folyamatban…' : stripeConfigured ? `Fizetés → ${formatMoney(totalCents)}` : `Teszt-rendelés → ${formatMoney(totalCents)}`}
            </button>
          </div>
        </form>
      </section>

      <aside className="glass-card p-6 h-fit">
        <h2 className="text-lg font-bold mb-3">Összesen</h2>
        <Row label="Részösszeg" value={formatMoney(subtotalCents)} />
        <Row label="Szállítás (EU)" value={formatMoney(shippingCents)} />
        <Row label="ÁFA (27%)" value={formatMoney(vatCents)} />
        <hr className="my-3 border-[var(--color-border)]" />
        <Row label="Fizetendő" value={formatMoney(totalCents)} bold />
        <p className="text-xs text-[var(--color-muted)] mt-4">
          A fizetés Stripe biztonságos check-out felületén történik. Kártya-adatokat NEM tárolunk.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
