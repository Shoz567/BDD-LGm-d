'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'Tout' },
  { id: 'aide_marche', label: 'Aide à la marche' },
  { id: 'chambre', label: 'Chambre & lit' },
  { id: 'fauteuils', label: 'Fauteuils' },
  { id: 'salle_de_bain', label: 'Salle de bain' },
  { id: 'toilettes', label: 'Toilettes' },
  { id: 'aides_techniques', label: 'Aides techniques' },
  { id: 'protections', label: 'Protections' },
  { id: 'soins', label: 'Soins' },
];

export function CatalogueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') ?? '';
  const currentCat = searchParams.get('cat') ?? '';

  const [inputValue, setInputValue] = useState(urlQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref pour toujours avoir la valeur à jour dans le timeout
  const catRef = useRef(currentCat);
  useEffect(() => { catRef.current = currentCat; }, [currentCat]);

  // Sync l'input quand l'URL change (ex : recherche depuis la topbar)
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  // Cleanup au démontage
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const navigate = (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('cat', cat);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate(value, catRef.current);
    }, 350);
  };

  const handleCatChange = (cat: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(inputValue, cat);
  };

  return (
    <div className="space-y-3">
      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un produit ou une référence…"
          className="w-full px-4 pr-9 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all placeholder:text-gray-400"
        />
        {inputValue && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <button
              onClick={() => handleSearchChange('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        )}
      </div>

      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCatChange(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
              currentCat === cat.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-white hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
