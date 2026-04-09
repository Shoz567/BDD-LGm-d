'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, X, Minus, Plus, Trash2, Package, FileDown, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { downloadClientPdf, downloadFournisseurPdf } from '@/lib/generatePdf';

export function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative grid h-[36px] w-[36px] place-items-center rounded-[10px] bg-white/10 border border-white/15 text-white/70 transition hover:bg-white/20 hover:text-white"
        aria-label="Panier"
      >
        <ShoppingCart className="h-[16px] w-[16px]" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-accent text-white text-[10px] font-black px-1 shadow">
            {count}
          </span>
        )}
      </button>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, remove, updateQty, total, clear } = useCart();
  const [loading, setLoading] = useState(false);

  const handleValider = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const refs = items.map(i => i.reference);
      const res = await fetch('/api/cart-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: refs }),
      });
      const pricesRaw: { reference: string; prix_achat: number | null; base_lppr: number | null }[] = await res.json();
      const prices: Record<string, { prix_achat: number | null }> = {};
      pricesRaw.forEach(p => { prices[p.reference] = { prix_achat: p.prix_achat }; });

      downloadClientPdf(items);
      setTimeout(() => downloadFournisseurPdf(items, prices), 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-primary" />
            <h2 className="text-base font-bold text-gray-900">Panier</h2>
            {items.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">({items.length} article{items.length > 1 ? 's' : ''})</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 py-20">
              <Package className="h-12 w-12" />
              <p className="text-sm font-medium">Votre panier est vide</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.reference} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="h-14 w-14 shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.nom} width={56} height={56} className="object-contain p-1" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-2">{item.nom}</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.reference}</p>
                  <p className="text-[13px] font-black text-brand-primary mt-1">
                    {item.prix_ttc
                      ? (item.prix_ttc * item.quantite).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                      : '—'}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.reference, item.quantite - 1)}
                      className="h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-[13px] font-bold text-gray-700">{item.quantite}</span>
                    <button onClick={() => updateQty(item.reference, item.quantite + 1)}
                      className="h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => remove(item.reference)}
                    className="text-red-400 hover:text-red-600 transition-colors" aria-label="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Total TTC</span>
              <span className="text-xl font-black text-brand-primary">
                {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>

            <button
              onClick={handleValider}
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Génération des PDF…</>
              ) : (
                <><FileDown className="h-4 w-4" /> Valider — Générer les PDF</>
              )}
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              2 PDF générés : devis client (TTC) + bon fournisseur (prix d'achat)
            </p>

            <button onClick={clear}
              className="w-full text-gray-400 hover:text-red-500 text-xs font-medium transition-colors text-center">
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}
