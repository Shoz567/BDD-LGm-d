'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  reference: string;
  nom: string;
  prix_ttc: number | null;
  image_url: string | null;
  quantite: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantite'>) => void;
  remove: (reference: string) => void;
  updateQty: (reference: string, quantite: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lgmad_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persister dans localStorage
  useEffect(() => {
    localStorage.setItem('lgmad_cart', JSON.stringify(items));
  }, [items]);

  const add = useCallback((item: Omit<CartItem, 'quantite'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.reference === item.reference);
      if (existing) {
        return prev.map((i) =>
          i.reference === item.reference ? { ...i, quantite: i.quantite + 1 } : i
        );
      }
      return [...prev, { ...item, quantite: 1 }];
    });
  }, []);

  const remove = useCallback((reference: string) => {
    setItems((prev) => prev.filter((i) => i.reference !== reference));
  }, []);

  const updateQty = useCallback((reference: string, quantite: number) => {
    if (quantite <= 0) {
      setItems((prev) => prev.filter((i) => i.reference !== reference));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.reference === reference ? { ...i, quantite } : i))
      );
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.quantite, 0);
  const total = items.reduce((sum, i) => sum + (i.prix_ttc ?? 0) * i.quantite, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
