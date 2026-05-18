'use client';
import { useEffect } from 'react';
import { useCart } from '@/lib/cart/CartContext';

export default function CartClearOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
