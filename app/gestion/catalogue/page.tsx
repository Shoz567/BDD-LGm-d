import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Tag, PackageX, Package } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters';

const PAGE_SIZE = 24;

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
  aide_marche: 'bg-blue-50 text-blue-700',
  chambre: 'bg-purple-50 text-purple-700',
  fauteuils: 'bg-indigo-50 text-indigo-700',
  salle_de_bain: 'bg-teal-50 text-teal-700',
  toilettes: 'bg-cyan-50 text-cyan-700',
  aides_techniques: 'bg-emerald-50 text-emerald-700',
  protections: 'bg-rose-50 text-rose-700',
  soins: 'bg-orange-50 text-orange-700',
};

interface SearchParams {
  q?: string;
  cat?: string;
  page?: string;
  basePath?: string;
}

async function getProducts(searchParams: SearchParams) {
  const search = searchParams.q?.trim() ?? '';
  const categorie = searchParams.cat ?? '';
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = getSupabaseAdmin()
    .from('products')
    .select('id, reference, nom, description, categorie, prix_ttc, prix_achat, base_lppr, image_url', { count: 'exact' })
    .order('nom', { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  if (categorie) query = query.eq('categorie', categorie);
  if (search) query = query.or(`nom.ilike.*${search}*,reference.ilike.*${search}*`);

  const { data, count, error } = await query;

  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    error: !!error,
  };
}

export default async function CataloguePage({ searchParams, basePath = '/catalogue', mode = 'gestion' }: { searchParams: Promise<SearchParams>; basePath?: string; mode?: 'comptoir' | 'gestion' }) {
  const resolvedParams = await searchParams;
  const { products, total, page, totalPages, error } = await getProducts(resolvedParams);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (resolvedParams.q) params.set('q', resolvedParams.q);
    if (resolvedParams.cat) params.set('cat', resolvedParams.cat);
    params.set('page', String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">

      {/* Header + Search toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Catalogue produits</h1>
            <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
              {total.toLocaleString('fr-FR')} référence{total > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/comptoir"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800 transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Mode Comptoir IA
          </Link>
        </div>

        <Suspense>
          <CatalogueFilters />
        </Suspense>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger le catalogue. Vérifiez la connexion Supabase.
        </div>
      )}

      {/* Product grid */}
      {!error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <PackageX className="h-10 w-10" />
          <p className="text-sm">Aucun produit trouvé pour cette recherche.</p>
        </div>
      )}

      {!error && products.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`${basePath}/${encodeURIComponent(product.reference)}`}
              className="group premium-card p-3 flex flex-col min-h-[300px]"
            >
              <div className="relative w-full h-44 bg-white rounded-2xl flex items-center justify-center shrink-0 mb-4">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.nom}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <Package className="h-10 w-10 text-gray-200" />
                )}
              </div>

              <div className="px-2 pb-2 flex flex-col gap-2.5 flex-1">
                {/* Catégorie badge */}
                <span className={`self-start text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${CATEGORIE_COLOR[product.categorie] ?? 'bg-gray-100 text-gray-600'}`}>
                  {CATEGORIE_LABEL[product.categorie] ?? product.categorie}
                </span>

                {/* Nom */}
                <p className="text-[15px] font-bold text-text-main leading-snug line-clamp-2 mt-1">
                  {product.nom}
                </p>

                {/* Référence */}
                <p className="text-[11px] text-gray-400 font-mono tracking-wide">{product.reference}</p>

                {/* Prix / Fournisseur */}
                <div className="mt-auto pt-3 border-t border-gray-100/80 flex flex-wrap items-center justify-between gap-2">
                  {mode === 'comptoir' ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold mb-0.5">Prix TTC</span>
                      <span className="text-[1.1rem] font-black text-brand-primary">
                        {product.prix_ttc
                          ? product.prix_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                          : <span className="text-gray-400 font-normal italic text-sm">—</span>}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold mb-0.5">Prix fournisseur</span>
                      <span className="text-[1.1rem] font-black text-gray-700">
                        {product.prix_achat
                          ? product.prix_achat.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                          : <span className="text-gray-400 font-normal italic text-sm">—</span>}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        TTC&nbsp;{product.prix_ttc
                          ? product.prix_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                          : '—'}
                      </span>
                    </div>
                  )}
                  {(product.base_lppr ?? 0) > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 font-semibold mb-0.5">Base LPPR</span>
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm border border-emerald-100/50">
                        <Tag className="h-3 w-3 shrink-0" />
                        {product.base_lppr!.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">Non remboursé</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-teal-400 hover:text-teal-600 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Suivant <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
