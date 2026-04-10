import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ArrowLeft, Package, FileText, CheckCircle2 } from 'lucide-react';
import { AddToListButton } from '@/components/particulier/AddToListButton';

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

function cleanDescription(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/^["]+/, '').replace(/["]+$/, '').trim();
}

export default async function ParticulierProductPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const { data: product } = await getSupabaseAdmin()
    .from('products')
    .select('*')
    .eq('reference', decodeURIComponent(reference))
    .single();

  if (!product) notFound();

  const description = cleanDescription(product.description);
  const catLabel = CATEGORIE_LABEL[product.categorie] ?? product.categorie;
  const hasRemboursement = (product.base_lppr ?? 0) > 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Retour */}
      <Link
        href="/particulier/catalogue"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#53636e', textDecoration: 'none', marginBottom: '24px' }}
      >
        <ArrowLeft size={14} /> Retour aux équipements
      </Link>

      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e3e9e5', overflow: 'hidden', boxShadow: '0 12px 40px rgba(23,33,43,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Image */}
        <div style={{ position: 'relative', minHeight: '380px', background: 'linear-gradient(135deg, #f6fbf8 0%, #fdf6ee 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', borderRight: '1px solid #f0f4f2' }}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nom}
              fill
              style={{ objectFit: 'contain', padding: '32px' }}
              sizes="450px"
            />
          ) : (
            <Package size={64} color="#c6ddd7" />
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Catégorie */}
          {catLabel && (
            <span style={{ alignSelf: 'flex-start', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '5px 12px', borderRadius: '999px', background: '#edf5f1', color: '#294e46', border: '1px solid #c6ddd7' }}>
              {catLabel}
            </span>
          )}

          {/* Nom */}
          <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            {product.nom}
          </h1>

          {/* Description */}
          {description && (
            <p style={{ margin: 0, fontSize: '14px', color: '#41525d', lineHeight: 1.7 }}>
              {description}
            </p>
          )}

          {/* Prix */}
          {product.prix_ttc && (
            <div style={{ padding: '16px', borderRadius: '14px', background: '#f6fbf8', border: '1px solid #e3e9e5' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: '#7aa087', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Prix conseillé
              </p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#294e46', letterSpacing: '-0.02em' }}>
                {product.prix_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          )}

          {/* Remboursement */}
          {hasRemboursement ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: '14px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
                  Cet équipement peut être remboursé
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#047857', lineHeight: 1.5 }}>
                  Sur prescription médicale, la Sécurité Sociale rembourse une partie du coût. Votre mutuelle peut compléter.{' '}
                  <Link href="/particulier/droits" style={{ color: '#065f46', fontWeight: 700, textDecoration: 'none' }}>
                    En savoir plus →
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                Cet équipement n&apos;est pas remboursé par la Sécurité Sociale. Votre mutuelle peut parfois prendre en charge une partie.
              </p>
            </div>
          )}

          {/* Bouton ajouter */}
          <AddToListButton
            reference={product.reference}
            nom={product.nom}
            prix_ttc={product.prix_ttc ?? null}
            image_url={product.image_url ?? null}
          />

          {/* PDF technique */}
          {product.pdf_url && (
            <a
              href={product.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#294e46', textDecoration: 'none', padding: '8px 0' }}
            >
              <FileText size={14} />
              Fiche technique complète (PDF)
            </a>
          )}

          {/* Référence discrète */}
          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
            Réf. {product.reference}
          </p>
        </div>
      </div>

      {/* Encart pharmacien */}
      <div style={{ marginTop: '24px', padding: '20px 24px', borderRadius: '18px', background: '#fff', border: '1px solid #e3e9e5', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '32px' }}>🏪</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#17212b' }}>
            Essayez-le en pharmacie avant d&apos;acheter
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#53636e', lineHeight: 1.5 }}>
            Votre pharmacien partenaire LGm@d peut vous le faire essayer et vous aider pour les démarches de remboursement.
          </p>
        </div>
        <Link
          href="/particulier/chat"
          style={{ padding: '10px 20px', borderRadius: '12px', background: '#edf5f1', border: '1px solid #c6ddd7', color: '#294e46', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          💬 Demander à Hellia
        </Link>
      </div>

    </div>
  );
}
