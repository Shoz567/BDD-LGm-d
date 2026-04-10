import Link from 'next/link';
import { ArrowLeft, Tag, Package, Hash, FileText } from 'lucide-react';
import { AddToCartButton } from '@/components/catalogue/AddToCartButton';

const CATEGORIE_LABEL: Record<string, string> = {
  aide_marche: 'Aide à la marche',
  chambre: 'Chambre & lit',
  fauteuils: 'Fauteuils',
  salle_de_bain: 'Salle de bain',
  toilettes: 'Toilettes',
  aides_techniques: 'Aides techniques',
  protections: 'Protections',
  soins: 'Soins',
};

const CATEGORIE_COLOR: Record<string, string> = {
  aide_marche: 'bg-blue-50 text-blue-700 border-blue-100',
  chambre: 'bg-purple-50 text-purple-700 border-purple-100',
  fauteuils: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  salle_de_bain: 'bg-teal-50 text-teal-700 border-teal-100',
  toilettes: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  aides_techniques: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  protections: 'bg-rose-50 text-rose-700 border-rose-100',
  soins: 'bg-orange-50 text-orange-700 border-orange-100',
};

interface Product {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  categorie?: string;
  prix_ttc?: number;
  prix_achat?: number;
  base_lppr?: number;
  image_url?: string;
  pdf_url?: string;
}

interface ProductDetailProps {
  product: Product;
  backHref: string;
  showPrixAchat?: boolean;
}

/** Supprime les guillemets parasites en début et fin de chaîne */
function cleanDescription(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/^["]+/, '').replace(/["]+$/, '').trim();
}

export function ProductDetail({ product, backHref, showPrixAchat = false }: ProductDetailProps) {
  const catColor = CATEGORIE_COLOR[product.categorie ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const catLabel = CATEGORIE_LABEL[product.categorie ?? ''] ?? product.categorie;
  const hasLPPR = (product.base_lppr ?? 0) > 0;
  const description = cleanDescription(product.description);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      {/* Retour */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au catalogue
      </Link>

      <div className="premium-card p-1">
        <div className="grid md:grid-cols-2 min-h-[500px]">

          {/* Image Side */}
          <div className="relative w-full h-[300px] md:h-full bg-white md:border-r border-gray-100 flex items-center justify-center p-8 rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none">
            {/* Subtle glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-orange-50/50 mix-blend-multiply opacity-50" />
            
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.nom}
                className="relative z-10 w-full h-full object-contain transform hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-4 text-gray-300">
                <Package className="h-20 w-20" />
                <p className="text-sm font-medium">Bientôt disponible</p>
              </div>
            )}
          </div>

          {/* Infos Side */}
          <div className="p-8 md:p-12 flex flex-col items-start bg-[#fcfcfc] rounded-b-[20px] md:rounded-r-[20px] md:rounded-bl-none">
            
            {/* Catégorie + référence */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              {catLabel && (
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full border ${catColor} shadow-sm`}>
                  {catLabel}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                {product.reference}
              </span>
            </div>

            {/* Nom */}
            <h1 className="text-2xl md:text-3xl font-black text-text-main leading-tight mb-4">
              {product.nom}
            </h1>

            {/* Description */}
            {description && (
              <div className="mb-8 w-full">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Description du produit</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed font-medium mt-3">
                  {description}
                </p>
              </div>
            )}

            {/* Prix */}
            <div className="mt-auto pt-6 border-t border-gray-200/60 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prix de vente TTC</p>
                  <p className="text-4xl font-black text-brand-primary">
                    {product.prix_ttc?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                  {showPrixAchat && (product.prix_achat ?? 0) > 0 && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        Prix fournisseur : <span className="font-bold text-gray-600">{product.prix_achat!.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Marge {Math.round(((product.prix_ttc! - product.prix_achat!) / product.prix_ttc!) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  {hasLPPR ? (
                    <div className="md:text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Base Remboursement</p>
                      <span className="inline-flex items-center gap-2 text-[15px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl shadow-sm">
                        <Tag className="h-4 w-4" />
                        LPPR {product.base_lppr!.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  ) : (
                    <div className="md:text-right flex items-center">
                      <p className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md">
                        Non remboursé
                      </p>
                    </div>
                  )}

                  <AddToCartButton
                    reference={product.reference}
                    nom={product.nom}
                    prix_ttc={product.prix_ttc ?? null}
                    image_url={product.image_url ?? null}
                  />

                  {product.pdf_url && (
                    <a
                      href={product.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary bg-brand-primary/5 border border-brand-primary/20 px-4 py-2 rounded-xl hover:bg-brand-primary/10 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Fiche technique PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
