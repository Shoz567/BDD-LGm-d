'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface Props {
  reference: string;
  nom: string;
  prix_ttc: number | null;
  image_url: string | null;
}

export function AddToCartButton({ reference, nom, prix_ttc, image_url }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    add({ reference, nom, prix_ttc, image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

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
