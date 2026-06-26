'use client';
import { useState } from 'react';
import { useCart, CartItem } from '@/lib/cart/CartContext';
import { Locale } from '@/lib/i18n/config';
import { getUi } from '@/lib/i18n/ui-strings';
import { getDict, tt } from '@/lib/i18n';

interface Props {
  locale: Locale;
  item: Omit<CartItem, 'quantity'>;
  label: string;
}

export default function AddToCartButton({ locale, item, label }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const ui = getUi(locale);
  const cartLabel = tt(getDict(locale), 'common.cart');

  function handleAdd() {
    add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="inline-flex items-center border border-[var(--color-border)] rounded-full">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-accent)]/10 rounded-l-full"
          aria-label="-"
        >
          −
        </button>
        <span className="w-10 text-center font-mono text-sm">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-accent)]/10 rounded-r-full"
          aria-label="+"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className={`px-7 py-3.5 rounded-full text-sm font-semibold transition-colors ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)]'
        }`}
      >
        {added ? `✓ ${ui.added}` : `🛒 ${label}`}
      </button>
      {added && (
        <a
          href={`/${locale}/kosar`}
          className="text-sm text-[var(--color-accent-2)] underline hover:no-underline"
        >
          {cartLabel} →
        </a>
      )}
    </div>
  );
}
