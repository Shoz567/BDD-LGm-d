'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { Trash2, Printer, ClipboardList, ArrowLeft, Plus, Minus, Share2, Check } from 'lucide-react';
import { useState } from 'react';

export default function ParticulierPanierPage() {
  const { items, remove, updateQty, total, clear } = useCart();
  const [copied, setCopied] = useState(false);

  const copyList = () => {
    const lines = items.map((i) => {
      const prix = i.prix_ttc != null ? ` — ${i.prix_ttc.toFixed(2)} €` : '';
      return `• ${i.nom} (x${i.quantite})${prix}`;
    });
    const text = `Ma liste d'équipements LGm@d :\n\n${lines.join('\n')}\n\nTotal estimé : ${total.toFixed(2)} €\n\nÀ présenter à votre pharmacien partenaire LGm@d.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      {/* Styles print */}
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e3e9e5 !important; }
        }
      `}</style>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '36px 20px 60px' }}>

        {/* Retour */}
        <Link href="/particulier/catalogue" className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#53636e', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Retour au catalogue
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#edf5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color="#294e46" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#17212b', letterSpacing: '-0.02em' }}>
                Ma liste d&apos;équipements
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#7aa087', fontWeight: 600 }}>
                {items.length === 0 ? 'Aucun équipement' : `${items.reduce((s, i) => s + i.quantite, 0)} équipement${items.reduce((s, i) => s + i.quantite, 0) > 1 ? 's' : ''} sélectionné${items.reduce((s, i) => s + i.quantite, 0) > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Encart pharmacien — toujours visible à l'impression */}
        <div className="print-card" style={{ padding: '16px 20px', borderRadius: '16px', background: '#fff', border: '1px solid #c6ddd7', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>🏪</span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#294e46' }}>
              Montrez cette liste à votre pharmacien
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#53636e', lineHeight: 1.5 }}>
              Votre pharmacien partenaire LGm@d peut vous conseiller, vous faire essayer les équipements et vous aider pour les remboursements.
            </p>
          </div>
        </div>

        {/* Liste vide */}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📋</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#17212b', margin: '0 0 8px' }}>
              Votre liste est vide
            </p>
            <p style={{ fontSize: '14px', color: '#53636e', margin: '0 0 24px' }}>
              Parcourez le catalogue et ajoutez les équipements qui vous intéressent.
            </p>
            <Link href="/particulier/catalogue" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', background: '#294e46', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Voir les équipements
            </Link>
          </div>
        )}

        {/* Produits */}
        {items.length > 0 && (
          <>
            <div className="print-card" style={{ borderRadius: '20px', background: '#fff', border: '1px solid #e3e9e5', overflow: 'hidden', marginBottom: '20px' }}>
              {items.map((item, i) => (
                <div
                  key={item.reference}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '18px 20px',
                    borderBottom: i < items.length - 1 ? '1px solid #f0f4f2' : 'none',
                  }}
                >
                  {/* Infos produit */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#17212b', lineHeight: 1.3 }}>
                      {item.nom}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7aa087', fontFamily: 'monospace' }}>
                      Réf. {item.reference}
                    </p>
                    {item.prix_ttc != null && (
                      <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700, color: '#294e46' }}>
                        {item.prix_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / unité
                      </p>
                    )}
                  </div>

                  {/* Contrôles quantité */}
                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQty(item.reference, item.quantite - 1)}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e3e9e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#53636e' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#17212b', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantite}
                    </span>
                    <button
                      onClick={() => updateQty(item.reference, item.quantite + 1)}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e3e9e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#53636e' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Sous-total */}
                  {item.prix_ttc != null && (
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#294e46', minWidth: '70px', textAlign: 'right', flexShrink: 0 }}>
                      {(item.prix_ttc * item.quantite).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  )}

                  {/* Supprimer */}
                  <button
                    className="no-print"
                    onClick={() => remove(item.reference)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #f2dac7', background: '#fff8f4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c85f18', flexShrink: 0 }}
                    title="Retirer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Total */}
              {total > 0 && (
                <div style={{ padding: '14px 20px', background: '#f6fbf8', borderTop: '1px solid #e3e9e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#53636e' }}>
                    Total estimé TTC
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#294e46' }}>
                    {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              )}
            </div>

            {/* Note remboursement */}
            <p style={{ fontSize: '12px', color: '#7aa087', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
              ℹ️ Ces prix sont indicatifs. Certains équipements peuvent être remboursés par la Sécurité Sociale ou votre mutuelle sur prescription médicale.{' '}
              <Link href="/particulier/droits" style={{ color: '#294e46', fontWeight: 700, textDecoration: 'none' }}>En savoir plus →</Link>
            </p>

            {/* Actions */}
            <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Imprimer */}
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '16px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)',
                  border: 'none', color: '#fff', fontSize: '15px', fontWeight: 800,
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(41,78,70,0.2)',
                }}
              >
                <Printer size={18} />
                Imprimer ma liste pour le pharmacien
              </button>

              {/* Copier */}
              <button
                onClick={copyList}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '14px', borderRadius: '16px',
                  background: '#fff', border: '1px solid #c6ddd7', color: '#294e46',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(23,33,43,0.06)',
                }}
              >
                {copied ? <Check size={16} color="#22c55e" /> : <Share2 size={16} />}
                {copied ? 'Liste copiée dans le presse-papier !' : 'Copier la liste (pour l\'envoyer par SMS ou email)'}
              </button>

              {/* Demander à Hellia */}
              <Link
                href="/particulier/chat"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '14px', borderRadius: '16px',
                  background: '#fff2e9', border: '1px solid #f2dac7', color: '#e97123',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}
              >
                💬 Demander à Hellia si ces équipements me conviennent
              </Link>

              {/* Vider */}
              <button
                onClick={clear}
                style={{ background: 'none', border: 'none', color: '#7aa087', fontSize: '13px', cursor: 'pointer', padding: '8px', textDecoration: 'underline' }}
              >
                Vider la liste
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
