'use client';
import { useCart } from '@/lib/cart/CartContext';
import { Locale } from '@/lib/i18n/config';

export default function CartIndicator({ locale }: { locale: Locale }) {
  const { itemCount } = useCart();
  return (
    <a
      href={`/${locale}/kosar`}
      className="relative inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] text-sm"
      aria-label={`Kosár (${itemCount} tétel)`}
    >
      <span>🛒</span>
      {itemCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold">
          {itemCount}
        </span>
      )}
    </a>
  );
}
