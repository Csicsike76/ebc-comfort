'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  unit_price_cents: number;
  currency: string;
  quantity: number;
  image_url?: string | null;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  currency: string;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartCtx = createContext<CartState | null>(null);

const STORAGE_KEY = 'ebc.cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.product_id !== productId);
      return prev.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalCents = items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
  const currency = items[0]?.currency ?? 'EUR';

  return (
    <CartCtx.Provider
      value={{ items, itemCount, subtotalCents, currency, add, remove, setQuantity, clear }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartCtx);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
