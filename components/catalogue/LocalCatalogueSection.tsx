'use client';

import { useEffect, useState } from 'react';
import { Package, Tag, Upload } from 'lucide-react';
import Link from 'next/link';
import { AddToCartButton } from './AddToCartButton';
import type { LocalProduct } from '@/app/gestion/admin/page';

const LS_KEY = 'lgmad_catalogue_extra';

const CATEGORIE_COLOR: Record<string, string> = {
  'aide à la marche': 'bg-blue-50 text-blue-700',
  'aide_marche':      'bg-blue-50 text-blue-700',
  'chambre':          'bg-purple-50 text-purple-700',
  'fauteuils':        'bg-indigo-50 text-indigo-700',
  'salle de bain':    'bg-teal-50 text-teal-700',
  'salle_de_bain':    'bg-teal-50 text-teal-700',
  'toilettes':        'bg-cyan-50 text-cyan-700',
  'aides techniques': 'bg-emerald-50 text-emerald-700',
  'aides_techniques': 'bg-emerald-50 text-emerald-700',
  'protections':      'bg-rose-50 text-rose-700',
  'soins':            'bg-orange-50 text-orange-700',
};

function getCatColor(cat: string) {
  return CATEGORIE_COLOR[cat.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
}

export function LocalCatalogueSection({ fullPage = false }: { fullPage?: boolean }) {
  const [products, setProducts] = useState<LocalProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setProducts(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  if (products.length === 0) {
    if (!fullPage) return null;
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Upload className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">Aucun produit importé</p>
        <Link href="/gestion/admin" className="text-sm font-bold text-amber-600 hover:underline">
          Importer un CSV →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bandeau */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Upload className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm font-bold text-amber-800">
            {products.length} produit{products.length > 1 ? 's' : ''} importé{products.length > 1 ? 's' : ''} localement
          </p>
          <span className="text-xs text-amber-600 hidden sm:inline">(mémoire locale — beta)</span>
        </div>
        <Link href="/gestion/admin" className="text-xs font-bold text-amber-700 hover:underline shrink-0">
          Gérer →
        </Link>
      </div>

      {/* Grille */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const prix = parseFloat(product.prix_ttc);
          const lppr = parseFloat(product.base_lppr);
          return (
            <div key={product.id} className="group premium-card p-3 flex flex-col min-h-[260px]">
              {/* Placeholder image */}
              <div className="relative w-full h-44 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 mb-4 border border-gray-100">
                <Package className="h-10 w-10 text-gray-200" />
              </div>

              <div className="px-2 pb-2 flex flex-col gap-2.5 flex-1">
                {/* Catégorie */}
                {product.categorie && (
                  <span className={`self-start text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${getCatColor(product.categorie)}`}>
                    {product.categorie}
                  </span>
                )}

                {/* Nom */}
                <p className="text-[15px] font-bold text-text-main leading-snug line-clamp-2 mt-1">
                  {product.nom}
                </p>

                {/* Référence */}
                <p className="text-[11px] text-gray-400 font-mono tracking-wide">{product.reference}</p>

                {/* Prix */}
                <div className="mt-auto pt-3 border-t border-gray-100/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-semibold mb-0.5">Prix TTC</span>
                    <span className="text-[1.1rem] font-black text-brand-primary">
                      {!isNaN(prix)
                        ? prix.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                        : <span className="text-gray-400 font-normal italic text-sm">—</span>}
                    </span>
                  </div>

                  {!isNaN(lppr) && lppr > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 font-semibold mb-0.5">Base LPPR</span>
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm border border-emerald-100/50">
                        <Tag className="h-3 w-3 shrink-0" />
                        {lppr.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">Non remboursé</span>
                  )}

                  <AddToCartButton
                    reference={product.reference}
                    nom={product.nom}
                    prix_ttc={!isNaN(prix) ? prix : null}
                    image_url={null}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
