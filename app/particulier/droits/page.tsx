import Link from 'next/link';

const SECTIONS = [
  {
    id: 'secu',
    emoji: '🏥',
    title: 'La Sécurité Sociale rembourse certains équipements',
    color: '#294e46',
    bg: '#edf5f1',
    border: '#c6ddd7',
    content: [
      {
        subtitle: 'Comment ça fonctionne ?',
        text: "Certains équipements médicaux (comme un fauteuil roulant, un déambulateur, un lit médicalisé) peuvent être remboursés partiellement par la Sécurité Sociale. Pour cela, il vous faut **une ordonnance** de votre médecin.",
      },
      {
        subtitle: 'Ce qu\'on appelle la « base de remboursement »',
        text: "La Sécurité Sociale rembourse selon un barème officiel appelé LPPR (Liste des Produits et Prestations Remboursables). En pratique, elle prend en charge **60 à 100 %** de ce barème. Votre mutuelle peut compléter le reste.",
      },
      {
        subtitle: 'Comment faire ?',
        text: "1. Consultez votre médecin et demandez-lui une ordonnance pour le matériel\n2. Rendez-vous dans votre pharmacie LGm@d partenaire\n3. La pharmacie se charge des démarches de remboursement pour vous",
      },
    ],
  },
  {
    id: 'apa',
    emoji: '👐',
    title: 'L\'APA : une aide financière pour les personnes âgées',
    color: '#e97123',
    bg: '#fff2e9',
    border: '#f2dac7',
    content: [
      {
        subtitle: 'C\'est quoi l\'APA ?',
        text: "L'APA (Allocation Personnalisée d'Autonomie) est une aide financière versée par votre département pour les personnes âgées de **60 ans et plus** qui ont des difficultés à accomplir les actes de la vie quotidienne seules.",
      },
      {
        subtitle: 'À quoi ça sert ?',
        text: "L'APA peut financer des aides à domicile, des équipements d'adaptation du logement, ou des séjours en établissement. Le montant varie selon votre degré de dépendance (évalué avec une grille appelée GIR).",
      },
      {
        subtitle: 'Comment en bénéficier ?',
        text: "Faites votre demande auprès du **Conseil Départemental** de votre domicile. Une assistante sociale ou votre CCAS (Centre Communal d'Action Sociale) peut vous aider à constituer le dossier gratuitement.",
      },
    ],
  },
  {
    id: 'mdph',
    emoji: '♿',
    title: 'La MDPH : pour les personnes en situation de handicap',
    color: '#4c7ecf',
    bg: '#eef3fb',
    border: '#c5d7f5',
    content: [
      {
        subtitle: 'C\'est quoi la MDPH ?',
        text: "La MDPH (Maison Départementale des Personnes Handicapées) est un guichet unique qui centralise toutes les aides pour les personnes en situation de handicap, **quel que soit l'âge**.",
      },
      {
        subtitle: 'La PCH : aide pour le matériel',
        text: "La MDPH peut attribuer la PCH (Prestation de Compensation du Handicap) qui peut financer des **aides techniques** comme un fauteuil roulant, un lit médicalisé, ou des adaptations du logement (barres d'appui, douche de plain-pied...)",
      },
      {
        subtitle: 'Comment faire ?',
        text: "Contactez la MDPH de votre département par téléphone ou sur mdph.fr. Ils vous envoient un dossier à remplir avec un certificat médical. Un travailleur social peut vous accompagner gratuitement.",
      },
    ],
  },
  {
    id: 'mutuelle',
    emoji: '🛡️',
    title: 'Votre mutuelle peut compléter le remboursement',
    color: '#7c3aed',
    bg: '#f3effe',
    border: '#d4c5f9',
    content: [
      {
        subtitle: 'Le principe du « reste à charge »',
        text: "Après le remboursement de la Sécurité Sociale, il vous reste souvent une part à payer. Votre mutuelle (aussi appelée complémentaire santé) peut prendre en charge tout ou partie de ce reste à charge.",
      },
      {
        subtitle: 'Que faire ?',
        text: "Avant d'acheter un équipement, appelez votre mutuelle pour savoir ce qu'elle rembourse. Demandez un **devis écrit** chez votre pharmacien — il facilitera vos démarches de remboursement.",
      },
      {
        subtitle: 'Vous n\'avez pas de mutuelle ?',
        text: "Si vos revenus sont modestes, vous pouvez bénéficier de la **Complémentaire Santé Solidaire (CSS)**, gratuite ou à faible coût. Renseignez-vous sur ameli.fr ou auprès de votre CPAM.",
      },
    ],
  },
];

export default function DroitsPage() {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/particulier" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#53636e', textDecoration: 'none', marginBottom: '16px' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
          Comprendre vos droits
        </h1>
        <p style={{ fontSize: '17px', color: '#53636e', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
          Les aides financières pour les équipements à domicile expliquées simplement — sans termes administratifs obscurs.
        </p>
      </div>

      {/* Bannière "Pas seul" */}
      <div style={{ padding: '18px 22px', borderRadius: '16px', background: '#fff', border: '1px solid #e3e9e5', marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '24px' }}>💬</span>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#17212b' }}>Vous n&apos;êtes pas seul pour ces démarches</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#53636e' }}>
            Votre pharmacien LGm@d peut vous orienter. Vous pouvez aussi{' '}
            <Link href="/particulier/chat" style={{ color: '#294e46', fontWeight: 700, textDecoration: 'none' }}>demander à Hellia</Link>
            {' '}de vous expliquer ce qui s&apos;applique à votre situation.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {SECTIONS.map((section) => (
          <div key={section.id} style={{ borderRadius: '20px', background: '#fff', border: `1px solid ${section.border}`, overflow: 'hidden', boxShadow: '0 6px 20px rgba(23,33,43,0.05)' }}>
            {/* En-tête section */}
            <div style={{ padding: '20px 24px', background: section.bg, borderBottom: `1px solid ${section.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>{section.emoji}</span>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: section.color, lineHeight: 1.3 }}>
                {section.title}
              </h2>
            </div>

            {/* Contenu */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {section.content.map((block, i) => (
                <div key={i}>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#17212b' }}>
                    {block.subtitle}
                  </p>
                  <div style={{ fontSize: '14px', color: '#41525d', lineHeight: 1.65 }}>
                    {block.text.split('\n').map((line, j) => (
                      <p key={j} style={{ margin: '0 0 4px' }}
                        dangerouslySetInnerHTML={{
                          __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#17212b;font-weight:700">$1</strong>')
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: '40px', padding: '28px', borderRadius: '20px', background: 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>
          Une question sur votre situation ?
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
          Hellia peut vous dire quelles aides vous pouvez demander selon votre situation.
        </p>
        <Link href="/particulier/chat" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 28px', borderRadius: '14px',
          background: '#fff', color: '#294e46',
          fontSize: '14px', fontWeight: 800, textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          💬 Parler à Hellia gratuitement
        </Link>
      </div>

    </div>
  );
}
