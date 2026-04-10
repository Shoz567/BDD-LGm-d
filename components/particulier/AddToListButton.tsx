'use client';

import { useState } from 'react';
import { ClipboardList, Check } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface Props {
  reference: string;
  nom: string;
  prix_ttc: number | null;
  image_url: string | null;
}

export function AddToListButton({ reference, nom, prix_ttc, image_url }: Props) {
  const { add, items } = useCart();
  const [flash, setFlash] = useState(false);
  const isInList = items.some((i) => i.reference === reference);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInList) return;
    add({ reference, nom, prix_ttc, image_url });
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 700,
        cursor: isInList ? 'default' : 'pointer',
        border: isInList || flash ? '1px solid #86efac' : '1px solid #c6ddd7',
        background: isInList || flash ? '#dcfce7' : '#edf5f1',
        color: isInList || flash ? '#166534' : '#294e46',
        transition: 'all .15s',
        marginTop: '8px',
      }}
    >
      {isInList || flash ? (
        <>
          <Check size={14} />
          Dans ma liste
        </>
      ) : (
        <>
          <ClipboardList size={14} />
          Ajouter à ma liste
        </>
      )}
    </button>
  );
}
