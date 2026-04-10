import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Package } from 'lucide-react';
import { AddToListButton } from '@/components/particulier/AddToListButton';

// Situations de vie → catégories Supabase
const SITUATIONS = [
  { id: '', label: 'Tout voir', emoji: '✨' },
  { id: 'aide_marche', label: "J'ai du mal à marcher", emoji: '🚶' },
  { id: 'salle_de_bain', label: 'Sécuriser la salle de bain', emoji: '🚿' },
  { id: 'chambre', label: 'Mieux dormir / se lever', emoji: '🛏️' },
  { id: 'fauteuils', label: 'Se déplacer en fauteuil', emoji: '♿' },
  { id: 'toilettes', label: 'Confort aux toilettes', emoji: '🚽' },
  { id: 'aides_techniques', label: 'Autres aides pratiques', emoji: '🔧' },
  { id: 'protections', label: 'Protections', emoji: '🛡️' },
];

interface SearchParams {
  cat?: string;
}

async function getProducts(cat: string) {
  let query = getSupabaseAdmin()
    .from('products')
    .select('id, reference, nom, description, categorie, prix_ttc, image_url')
    .order('nom', { ascending: true })
    .limit(32);

  if (cat) query = query.eq('categorie', cat);

  const { data } = await query;
  return data ?? [];
}

export default async function ParticulierCataloguePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { cat = '' } = await searchParams;
  const products = await getProducts(cat);
  const currentSituation = SITUATIONS.find((s) => s.id === cat) ?? SITUATIONS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <Link href="/particulier" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#53636e', textDecoration: 'none', marginBottom: '16px' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          Trouver le bon équipement
        </h1>
        <p style={{ fontSize: '16px', color: '#53636e', margin: 0 }}>
          Choisissez votre situation pour voir les équipements adaptés.
        </p>
      </div>

      {/* Filtres par situation de vie */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
        {SITUATIONS.map((s) => (
          <Link
            key={s.id}
            href={s.id ? `/particulier/catalogue?cat=${s.id}` : '/particulier/catalogue'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              background: cat === s.id ? '#294e46' : '#fff',
              color: cat === s.id ? '#fff' : '#41525d',
              border: `1px solid ${cat === s.id ? '#294e46' : '#d8e6df'}`,
              boxShadow: cat === s.id ? '0 4px 12px rgba(41,78,70,0.2)' : '0 2px 8px rgba(23,33,43,0.04)',
              transition: 'all .15s',
            }}
          >
            <span>{s.emoji}</span>
            {s.label}
          </Link>
        ))}
      </div>

      {/* Titre situation active */}
      {cat && (
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>{currentSituation.emoji}</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#294e46' }}>
            {currentSituation.label}
          </h2>
          <span style={{ fontSize: '13px', color: '#7aa087', fontWeight: 600 }}>
            — {products.length} équipement{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Grille produits */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7aa087' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#17212b', margin: '0 0 8px' }}>Aucun équipement pour cette situation</p>
          <p style={{ fontSize: '14px', margin: '0 0 20px' }}>Essayez une autre situation ou demandez conseil à Hellia.</p>
          <Link href="/particulier/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', background: '#294e46', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            💬 Demander à Hellia
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/particulier/catalogue/${encodeURIComponent(product.reference)}`}
              style={{
                borderRadius: '20px',
                background: '#fff',
                border: '1px solid #e3e9e5',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(23,33,43,0.05)',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                transition: 'box-shadow .18s, transform .18s',
              }}
            >
              {/* Image */}
              <div style={{ height: '160px', background: '#f6fbf8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.nom} fill style={{ objectFit: 'contain', padding: '12px' }} sizes="240px" />
                ) : (
                  <Package size={40} color="#c6ddd7" />
                )}
              </div>

              {/* Infos */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#17212b', lineHeight: 1.35 }}>
                  {product.nom}
                </p>

                {product.description && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#667085', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #e3e9e5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    {product.prix_ttc ? (
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#294e46' }}>
                        {product.prix_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#7aa087', fontWeight: 600 }}>Prix en pharmacie</span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '999px', background: '#edf5f1', color: '#294e46', border: '1px solid #c6ddd7', whiteSpace: 'nowrap' }}>
                      En pharmacie
                    </span>
                  </div>
                  <AddToListButton
                    reference={product.reference}
                    nom={product.nom}
                    prix_ttc={product.prix_ttc ?? null}
                    image_url={product.image_url ?? null}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA Hellia */}
      <div style={{
        marginTop: '48px', padding: '24px', borderRadius: '20px',
        background: '#fff2e9', border: '1px solid #f2dac7',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '40px' }}>💬</div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#17212b' }}>
            Vous ne savez pas lequel choisir ?
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#53636e' }}>
            Hellia vous pose quelques questions et vous recommande l&apos;équipement le plus adapté à votre situation.
          </p>
        </div>
        <Link href="/particulier/chat" style={{ padding: '11px 22px', borderRadius: '14px', background: '#e97123', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(233,113,35,.25)' }}>
          Demander à Hellia →
        </Link>
      </div>

    </div>
  );
}
