'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface Props {
  reference: string;
  nom: string;
  prix_ttc: number | null;
  image_url: string | null;
  /** 'sm' = icône carrée pour les grilles, 'md' = bouton texte (défaut) */
  size?: 'sm' | 'md';
}

export function AddToCartButton({ reference, nom, prix_ttc, image_url, size = 'md' }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ reference, nom, prix_ttc, image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (size === 'sm') {
    return (
      <button
        onClick={handleClick}
        title={added ? 'Ajouté !' : 'Ajouter au panier'}
        aria-label={added ? 'Ajouté au panier' : 'Ajouter au panier'}
        className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-200 shrink-0 ${
          added
            ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
            : 'bg-white border-gray-200 text-gray-400 hover:border-brand-primary hover:text-brand-primary hover:bg-teal-50'
        }`}
      >
        {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
        added
          ? 'bg-emerald-500 text-white border border-emerald-400'
          : 'bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-95'
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </>
      )}
    </button>
  );
}
