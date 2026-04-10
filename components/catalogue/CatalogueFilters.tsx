'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, Package, Search, Upload } from 'lucide-react';

const LS_KEY = 'lgmad_catalogue_extra';

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

interface Suggestion {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  image_url: string | null;
}

export function CatalogueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') ?? '';
  const currentCat = searchParams.get('cat') ?? '';

  const [inputValue, setInputValue] = useState(urlQ);
  const [localCount, setLocalCount] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catRef = useRef(currentCat);
  const skipSyncRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { catRef.current = currentCat; }, [currentCat]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setLocalCount(JSON.parse(stored).length);
    } catch { /* ignore */ }
  }, []);

  // Sync depuis l'URL uniquement si navigation externe (ex: topbar)
  useEffect(() => {
    if (skipSyncRef.current) { skipSyncRef.current = false; return; }
    setInputValue(urlQ);
  }, [urlQ]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
  }, []);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return; }

    suggestDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 180);
  }, []);

  const navigate = (q: string, cat: string) => {
    skipSyncRef.current = true;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('cat', cat);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    fetchSuggestions(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value, catRef.current), 350);
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate('', catRef.current);
  };

  const handleCatChange = (cat: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(inputValue, cat);
  };

  const detailBase = pathname.startsWith('/gestion') ? '/gestion/catalogue' : '/catalogue';

  const handleSelectSuggestion = (s: Suggestion) => {
    setShowDropdown(false);
    router.push(`${detailBase}/${encodeURIComponent(s.reference)}`);
  };

  const handleShowAll = () => {
    setShowDropdown(false);
    navigate(inputValue, catRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Recherche avec dropdown */}
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder="Rechercher un produit ou une référence…"
          className="w-full px-4 pr-9 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all placeholder:text-gray-400"
        />
        {inputValue && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </span>
        )}

        {/* Dropdown suggestions */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onMouseDown={() => handleSelectSuggestion(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex ? 'bg-teal-50' : 'hover:bg-gray-50'
                } ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {s.image_url ? (
                    <Image src={s.image_url} alt={s.nom} width={40} height={40} className="object-contain p-0.5" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{s.nom}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{s.reference}</p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {CATEGORIE_LABEL[s.categorie] ?? s.categorie}
                </span>
              </button>
            ))}

            {/* Voir tous les résultats */}
            <button
              onMouseDown={handleShowAll}
              className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-gray-50/80 hover:bg-teal-50 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="text-[12px] text-teal-700 font-semibold">
                Voir tous les résultats pour &laquo;&nbsp;{inputValue}&nbsp;&raquo;
              </span>
            </button>
          </div>
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

        {/* Catégorie "Produits ajoutés" — uniquement si des produits locaux existent */}
        {localCount > 0 && (
          <button
            onClick={() => handleCatChange('produits_ajoutes')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
              currentCat === 'produits_ajoutes'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            }`}
          >
            <Upload className="h-3 w-3" />
            Produits ajoutés
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${currentCat === 'produits_ajoutes' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-800'}`}>
              {localCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
