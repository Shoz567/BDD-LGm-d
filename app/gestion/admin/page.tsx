'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, Package, BarChart3, ArrowLeft, FileText, Trash2, Edit3, CheckCircle } from 'lucide-react';

interface CsvProduct {
  nom: string;
  reference: string;
  categorie: string;
  prix_ttc: string;
  base_lppr?: string;
  badges?: string;
}

const SAMPLE_PRODUCTS: (CsvProduct & { id: number })[] = [
  { id: 1, nom: 'Rollator 4 roues standard', reference: 'ROL-001', categorie: 'Aide à la marche', prix_ttc: '189.00', base_lppr: '97.00', badges: 'vente' },
  { id: 2, nom: 'Lit médicalisé électrique 1 moteur', reference: 'LIT-001', categorie: 'Chambre', prix_ttc: '890.00', base_lppr: '490.00', badges: 'location' },
  { id: 3, nom: 'Fauteuil roulant manuel standard', reference: 'FR-001', categorie: 'Fauteuils', prix_ttc: '340.00', base_lppr: '182.00', badges: 'location' },
  { id: 4, nom: 'Siège de douche rabattable', reference: 'SDB-002', categorie: 'Salle de bain', prix_ttc: '95.00', badges: 'vente' },
  { id: 5, nom: 'Cadre de toilette réglable', reference: 'WC-001', categorie: 'Toilettes', prix_ttc: '55.00', badges: 'vente' },
];

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  vente: { bg: '#edf5f1', color: '#294e46' },
  location: { bg: '#fff2e9', color: '#c85f18' },
  prestataire: { bg: '#f4f7f6', color: '#39544d' },
};

function euro(v: string) {
  return parseFloat(v).toFixed(2).replace('.', ',') + ' €';
}

export default function AdminPage() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'list'>('import');

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setImportStatus('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(Boolean);
        if (lines.length < 2) { setImportStatus('error'); return; }

        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
        const nomIdx = headers.indexOf('nom');
        const refIdx = headers.indexOf('reference');
        const catIdx = headers.indexOf('categorie');
        const prixIdx = headers.indexOf('prix_ttc');
        const lpprIdx = headers.indexOf('base_lppr');
        const badgesIdx = headers.indexOf('badges');

        if (nomIdx < 0 || refIdx < 0 || prixIdx < 0) { setImportStatus('error'); return; }

        const imported: (CsvProduct & { id: number })[] = lines.slice(1).map((line, i) => {
          const cols = parseCsvLine(line);
          return {
            id: Date.now() + i,
            nom: cols[nomIdx] || '',
            reference: cols[refIdx] || '',
            categorie: catIdx >= 0 ? cols[catIdx] || '' : '',
            prix_ttc: cols[prixIdx] || '0',
            base_lppr: lpprIdx >= 0 ? cols[lpprIdx] : undefined,
            badges: badgesIdx >= 0 ? cols[badgesIdx] : undefined,
          };
        }).filter((p) => p.nom);

        setProducts((prev) => [...prev, ...imported]);
        setImportCount(imported.length);
        setImportStatus('success');
        setActiveTab('list');
      } catch {
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

  function deleteProduct(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const STAT_CARDS = [
    { label: 'Produits en base', value: products.length, icon: '📦', color: '#294e46' },
    { label: 'Dernier import', value: importStatus === 'success' ? `${importCount} ajoutés` : '—', icon: '📥', color: '#e97123' },
    { label: 'Catégories', value: [...new Set(products.map((p) => p.categorie).filter(Boolean))].length, icon: '🗂️', color: '#4c7ecf' },
    { label: 'Avec LPPR', value: products.filter((p) => p.base_lppr).length, icon: '💊', color: '#4fa7a1' },
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
              Gérez votre catalogue produits : importez un fichier CSV et consultez les produits enregistrés.
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

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            style={{
              padding: '18px', borderRadius: '18px', background: '#fff',
              border: '1px solid #e3e9e5', boxShadow: '0 8px 20px rgba(23,33,43,.04)',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#667085', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {s.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: s.color, letterSpacing: '-.02em' }}>
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { id: 'import', label: '📥 Import CSV', icon: Upload },
          { id: 'list', label: '📦 Produits en base', icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'import' | 'list')}
            style={{
              padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
              border: activeTab === tab.id ? `2px solid #294e46` : '1px solid #e3e9e5',
              background: activeTab === tab.id ? '#294e46' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#17212b',
              cursor: 'pointer', transition: '.14s ease',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(41,78,70,.2)' : '0 2px 8px rgba(23,33,43,.04)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Import tab */}
      {activeTab === 'import' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Drop zone */}
          <div
            style={{
              padding: '24px', borderRadius: '22px',
              background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)',
              border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingLeft: '14px', borderLeft: '6px solid #294e46' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>Import CSV</h2>
            </div>

            {importStatus === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                background: '#edf5f1', border: '1px solid #c6ddd7',
              }}>
                <CheckCircle size={16} color="#294e46" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#294e46' }}>
                  {importCount} produit{importCount > 1 ? 's' : ''} importé{importCount > 1 ? 's' : ''} avec succès
                </span>
              </div>
            )}

            {importStatus === 'error' && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                background: '#fff2e9', border: '1px solid #f2dac7',
                fontSize: '13px', fontWeight: 700, color: '#c85f18',
              }}>
                ⚠️ Format invalide. Vérifiez que le fichier est un CSV avec les colonnes : nom, reference, prix_ttc.
              </div>
            )}

            {/* Drop zone */}
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
                ou cliquez pour parcourir
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
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

          {/* CSV format guide */}
          <div style={{
            padding: '24px', borderRadius: '22px',
            background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)',
            border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingLeft: '14px', borderLeft: '6px solid #e97123' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>Format attendu</h2>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#53636e', lineHeight: '1.5' }}>
              Le fichier CSV doit utiliser le séparateur <code style={{ background: '#edf5f1', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, color: '#294e46' }}>;</code> et inclure les colonnes suivantes :
            </p>

            <div style={{ display: 'grid', gap: '8px' }}>
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
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
                    background: f.required ? '#edf5f1' : '#f4f6f5',
                    color: f.required ? '#294e46' : '#667085',
                    border: f.required ? '1px solid #c6ddd7' : '1px solid #e3e9e5',
                  }}>
                    {f.required ? 'Requis' : 'Optionnel'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product list tab */}
      {activeTab === 'list' && (
        <div style={{
          borderRadius: '22px', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.62) 100%)',
          border: '1px solid rgba(227,233,229,.92)', boxShadow: '0 10px 24px rgba(23,33,43,.05)',
        }}>
          <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e3e9e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '14px', borderLeft: '6px solid #294e46' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#294e46' }}>
                Produits en base
              </h2>
              <span style={{
                fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px',
                background: '#edf5f1', border: '1px solid #c6ddd7', color: '#294e46',
              }}>
                {products.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#667085', padding: '4px 10px' }}>
                <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Catalogue conseil · Prix publics TTC
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#667085' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '18px', color: '#17212b' }}>Catalogue vide</p>
              <p style={{ margin: 0, fontSize: '14px' }}>Importez des produits depuis l&apos;onglet Import CSV.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f6fbf8' }}>
                  {['Produit', 'Référence', 'Catégorie', 'Prix TTC', 'LPPR', 'Badges', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#667085', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #e3e9e5' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < products.length - 1 ? '1px solid #e3e9e5' : 'none',
                      background: i % 2 === 0 ? '#fff' : 'rgba(246,251,248,.5)',
                    }}
                  >
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e3e9e5', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#294e46' }}
                          title="Modifier"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #f2dac7', background: '#fff8f4', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#c85f18' }}
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
