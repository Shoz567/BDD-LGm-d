'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Package, ArrowLeft, FileText, Trash2, Edit3, CheckCircle, AlertTriangle } from 'lucide-react';

const LS_KEY = 'lgmad_catalogue_extra';

export interface LocalProduct {
  id: string;
  nom: string;
  reference: string;
  categorie: string;
  prix_ttc: string;
  base_lppr: string;
  badges: string;
  imported_at: string;
}

const SAMPLE_PRODUCTS: LocalProduct[] = [
  { id: 'demo-1', nom: 'Rollator 4 roues standard', reference: 'ROL-001', categorie: 'Aide à la marche', prix_ttc: '189.00', base_lppr: '97.00', badges: 'vente', imported_at: '' },
  { id: 'demo-2', nom: 'Lit médicalisé électrique 1 moteur', reference: 'LIT-001', categorie: 'Chambre', prix_ttc: '890.00', base_lppr: '490.00', badges: 'location', imported_at: '' },
  { id: 'demo-3', nom: 'Fauteuil roulant manuel standard', reference: 'FR-001', categorie: 'Fauteuils', prix_ttc: '340.00', base_lppr: '182.00', badges: 'location', imported_at: '' },
  { id: 'demo-4', nom: 'Siège de douche rabattable', reference: 'SDB-002', categorie: 'Salle de bain', prix_ttc: '95.00', base_lppr: '', badges: 'vente', imported_at: '' },
  { id: 'demo-5', nom: 'Cadre de toilette réglable', reference: 'WC-001', categorie: 'Toilettes', prix_ttc: '55.00', base_lppr: '', badges: 'vente', imported_at: '' },
];

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  vente: { bg: '#edf5f1', color: '#294e46' },
  location: { bg: '#fff2e9', color: '#c85f18' },
  prestataire: { bg: '#f4f7f6', color: '#39544d' },
};

function euro(v: string) {
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  return n.toFixed(2).replace('.', ',') + ' €';
}

function detectSeparator(line: string): string {
  const commas = (line.match(/,/g) ?? []).length;
  const semis = (line.match(/;/g) ?? []).length;
  return semis >= commas ? ';' : ',';
}

function parseCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default function AdminPage() {
  const [importedProducts, setImportedProducts] = useState<LocalProduct[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState('');
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'list'>('import');

  // Charger depuis localStorage, en s'assurant que les démos sont toujours présentes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      const existing: LocalProduct[] = stored ? JSON.parse(stored) : [];
      const existingIds = new Set(existing.map((p) => p.id));
      // Ajouter les démos manquantes en tête de liste
      const missingDemos = SAMPLE_PRODUCTS.filter((d) => !existingIds.has(d.id));
      const merged = [...missingDemos, ...existing];
      if (missingDemos.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify(merged));
      }
      setImportedProducts(merged);
    } catch { /* ignore */ }
  }, []);

  function saveToLS(products: LocalProduct[]) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(products));
    } catch { /* ignore */ }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setImportError('Le fichier doit être au format .csv');
      setImportStatus('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          setImportError('Le fichier est vide ou ne contient pas de données.');
          setImportStatus('error');
          return;
        }

        const sep = detectSeparator(lines[0]);
        const headers = parseCsvLine(lines[0], sep).map((h) => h.toLowerCase().replace(/[^a-z_]/g, '').trim());

        const idx = (name: string) => headers.indexOf(name);
        const nomIdx   = idx('nom');
        const refIdx   = idx('reference');
        const prixIdx  = idx('prix_ttc');
        const catIdx   = idx('categorie');
        const lpprIdx  = idx('base_lppr');
        const badgeIdx = idx('badges');

        if (nomIdx < 0 || refIdx < 0 || prixIdx < 0) {
          setImportError(`Colonnes obligatoires manquantes. Colonnes détectées : ${headers.join(', ')}. Séparateur détecté : "${sep}".`);
          setImportStatus('error');
          return;
        }

        const now = new Date().toISOString();
        const imported: LocalProduct[] = lines.slice(1)
          .map((line, i) => {
            const cols = parseCsvLine(line, sep);
            return {
              id: `csv-${Date.now()}-${i}`,
              nom: cols[nomIdx]?.trim() ?? '',
              reference: cols[refIdx]?.trim() ?? '',
              categorie: catIdx >= 0 ? cols[catIdx]?.trim() ?? '' : '',
              prix_ttc: prixIdx >= 0 ? (cols[prixIdx]?.replace(',', '.').trim() ?? '0') : '0',
              base_lppr: lpprIdx >= 0 ? (cols[lpprIdx]?.replace(',', '.').trim() ?? '') : '',
              badges: badgeIdx >= 0 ? cols[badgeIdx]?.trim() ?? '' : '',
              imported_at: now,
            };
          })
          .filter((p) => p.nom && p.reference);

        if (imported.length === 0) {
          setImportError('Aucun produit valide trouvé dans le fichier (nom et reference requis).');
          setImportStatus('error');
          return;
        }

        const updated = [...importedProducts, ...imported];
        setImportedProducts(updated);
        saveToLS(updated);
        setImportCount(imported.length);
        setImportStatus('success');
        setActiveTab('list');
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Erreur de lecture');
        setImportStatus('error');
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function deleteImported(id: string) {
    const updated = importedProducts.filter((p) => p.id !== id);
    setImportedProducts(updated);
    saveToLS(updated);
  }

  function clearAll() {
    setImportedProducts([]);
    saveToLS([]);
  }

  const allProducts = importedProducts;

  const STAT_CARDS = [
    { label: 'Produits en base', value: allProducts.length, icon: '📦', color: '#294e46' },
    { label: 'Importés CSV', value: importedProducts.length, icon: '📥', color: '#e97123' },
    { label: 'Catégories', value: [...new Set(allProducts.map((p) => p.categorie).filter(Boolean))].length, icon: '🗂️', color: '#4c7ecf' },
    { label: 'Avec LPPR', value: allProducts.filter((p) => p.base_lppr).length, icon: '💊', color: '#4fa7a1' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '16px' }}>

      {/* Header */}
      <div style={{
        padding: '22px 24px', borderRadius: '26px',
        background: 'linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.76) 100%)',
        border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#667085', marginBottom: '10px' }}>
          <Link href="/gestion" style={{ color: '#294e46', fontWeight: 700 }}>Dashboard</Link>
          <span>›</span>
          <span>Administration catalogue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '30px', fontWeight: 800, letterSpacing: '-.03em', color: '#294e46' }}>
              Administration
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#53636e' }}>
              Importez un CSV pour enrichir le catalogue. Les produits importés apparaissent immédiatement dans le catalogue.
            </p>
          </div>
          <Link
            href="/gestion/catalogue"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
              background: '#fff', border: '1px solid #e3e9e5', color: '#294e46',
              textDecoration: 'none', boxShadow: '0 2px 8px rgba(23,33,43,.04)',
            }}
          >
            <ArrowLeft size={14} /> Voir le catalogue
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} style={{ padding: '18px', borderRadius: '18px', background: '#fff', border: '1px solid #e3e9e5', boxShadow: '0 8px 20px rgba(23,33,43,.04)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#667085', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: s.color, letterSpacing: '-.02em' }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {(['import', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
              border: activeTab === tab ? '2px solid #294e46' : '1px solid #e3e9e5',
              background: activeTab === tab ? '#294e46' : '#fff',
              color: activeTab === tab ? '#fff' : '#17212b',
              cursor: 'pointer', transition: '.14s ease',
            }}
          >
            {tab === 'import' ? '📥 Import CSV' : `📦 Produits en base (${allProducts.length})`}
          </button>
        ))}
      </div>

      {/* Import tab */}
      {activeTab === 'import' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Drop zone */}
          <div style={{ padding: '24px', borderRadius: '22px', background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)', border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingLeft: '14px', borderLeft: '6px solid #294e46' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>Import CSV</h2>
            </div>

            {importStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', background: '#edf5f1', border: '1px solid #c6ddd7' }}>
                <CheckCircle size={16} color="#294e46" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#294e46' }}>
                  {importCount} produit{importCount > 1 ? 's' : ''} importé{importCount > 1 ? 's' : ''} avec succès — visibles dans le catalogue
                </span>
              </div>
            )}

            {importStatus === 'error' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', background: '#fff2e9', border: '1px solid #f2dac7' }}>
                <AlertTriangle size={16} color="#c85f18" style={{ marginTop: '1px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#c85f18' }}>{importError}</span>
              </div>
            )}

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? '#294e46' : '#d8e6df'}`,
                borderRadius: '16px', padding: '36px 20px', textAlign: 'center',
                cursor: 'pointer', transition: '.2s ease',
                background: isDragOver ? '#edf5f1' : '#fafcfb',
              }}
            >
              <Upload size={32} color={isDragOver ? '#294e46' : '#7aa087'} style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#294e46' }}>
                Glisser-déposer votre fichier CSV
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#667085' }}>
                Séparateur , ou ; — encodage UTF-8
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', marginTop: '14px', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(180deg, #f28a45 0%, #e97123 100%)',
                border: 'none', color: '#fff', fontWeight: 800, fontSize: '14px',
                cursor: 'pointer', boxShadow: '0 8px 18px rgba(233,113,35,.22)',
              }}
            >
              Sélectionner un fichier CSV
            </button>
          </div>

          {/* Format guide */}
          <div style={{ padding: '24px', borderRadius: '22px', background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)', border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingLeft: '14px', borderLeft: '6px solid #e97123' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>Format attendu</h2>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#53636e', lineHeight: '1.5' }}>
              Séparateur auto-détecté (<code style={{ background: '#edf5f1', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, color: '#294e46' }}>,</code> ou <code style={{ background: '#edf5f1', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, color: '#294e46' }}>;</code>). Colonnes :
            </p>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
              {[
                { col: 'nom', desc: 'Nom du produit', required: true },
                { col: 'reference', desc: 'Référence unique', required: true },
                { col: 'prix_ttc', desc: 'Prix TTC (ex: 189.00)', required: true },
                { col: 'categorie', desc: 'Catégorie produit', required: false },
                { col: 'base_lppr', desc: 'Base LPPR si applicable', required: false },
                { col: 'badges', desc: 'vente / location / prestataire', required: false },
              ].map((f) => (
                <div key={f.col} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', background: '#f6fbf8', border: '1px solid #e3e9e5' }}>
                  <code style={{ fontSize: '12px', fontWeight: 800, color: '#294e46', minWidth: '100px' }}>{f.col}</code>
                  <span style={{ fontSize: '13px', color: '#53636e', flex: 1 }}>{f.desc}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', background: f.required ? '#edf5f1' : '#f4f6f5', color: f.required ? '#294e46' : '#667085', border: f.required ? '1px solid #c6ddd7' : '1px solid #e3e9e5' }}>
                    {f.required ? 'Requis' : 'Optionnel'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f6fbf8', border: '1px solid #e3e9e5', fontFamily: 'monospace', fontSize: '11px', color: '#41525d', lineHeight: '1.6' }}>
              nom;reference;prix_ttc;categorie<br />
              Déambulateur léger;DEM-042;129.00;Aide à la marche<br />
              Lit médicalisé;LIT-003;750.00;Chambre
            </div>
          </div>
        </div>
      )}

      {/* List tab */}
      {activeTab === 'list' && (
        <div style={{ borderRadius: '22px', overflow: 'hidden', background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)', border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)' }}>
          <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e3e9e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '14px', borderLeft: '6px solid #294e46' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>Produits en base</h2>
              <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', background: '#edf5f1', border: '1px solid #c6ddd7', color: '#294e46' }}>
                {allProducts.length}
              </span>
            </div>
            {importedProducts.length > 0 && (
              <button
                onClick={clearAll}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #f2dac7', background: '#fff8f4', color: '#c85f18', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Trash2 size={12} /> Supprimer tous les importés ({importedProducts.length})
              </button>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6fbf8' }}>
                {['Produit', 'Référence', 'Catégorie', 'Prix TTC', 'LPPR', 'Badges', 'Source', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#667085', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #e3e9e5' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProducts.map((p, i) => {
                const isImported = p.imported_at !== '';
                return (
                  <tr key={p.id} style={{ borderBottom: i < allProducts.length - 1 ? '1px solid #e3e9e5' : 'none', background: isImported ? 'rgba(255,242,233,.3)' : (i % 2 === 0 ? '#fff' : 'rgba(246,251,248,.5)') }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#123127' }}>{p.nom}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#667085', fontFamily: 'monospace' }}>{p.reference}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#41525d' }}>{p.categorie || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '15px', fontWeight: 800, color: '#294e46' }}>{euro(p.prix_ttc)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#667085' }}>{p.base_lppr ? euro(p.base_lppr) : '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.badges && p.badges.split(',').map((b) => {
                        const badge = b.trim();
                        const colors = BADGE_COLORS[badge] || BADGE_COLORS.vente;
                        return (
                          <span key={badge} style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', background: colors.bg, color: colors.color, marginRight: '4px' }}>
                            {badge.charAt(0).toUpperCase() + badge.slice(1)}
                          </span>
                        );
                      })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: isImported ? '#fff2e9' : '#f4f6f5', color: isImported ? '#c85f18' : '#667085', border: `1px solid ${isImported ? '#f2dac7' : '#e3e9e5'}` }}>
                        {isImported ? 'CSV importé' : 'Démo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isImported && (
                        <button
                          onClick={() => deleteImported(p.id)}
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #f2dac7', background: '#fff8f4', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#c85f18' }}
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
