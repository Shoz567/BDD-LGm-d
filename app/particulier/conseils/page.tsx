import Link from 'next/link';

const FICHES = [
  {
    emoji: '🚿',
    title: 'Sécuriser la salle de bain',
    duree: '4 min',
    color: '#4c7ecf',
    bg: '#eef3fb',
    border: '#c5d7f5',
    intro: 'La salle de bain est l\'endroit où survient le plus d\'accidents à domicile. Quelques aménagements simples permettent de les éviter.',
    points: [
      { label: 'Les barres d\'appui', text: 'Des barres fixées au mur près de la douche ou des toilettes donnent un point d\'appui solide. Elles sont faciles à poser et peu coûteuses.' },
      { label: 'Le tapis antidérapant', text: 'Un simple tapis antidérapant dans la douche ou le bain réduit fortement le risque de glissade.' },
      { label: 'Le siège de douche', text: 'Un siège pliant ou fixe permet de se laver assis, ce qui est beaucoup moins fatigant et plus sécurisé.' },
      { label: 'La douche à l\'italienne', text: 'Si vous rénovez, une douche sans rebord (plain-pied) est l\'aménagement le plus sûr. Des aides financières existent pour ce type de travaux.' },
    ],
  },
  {
    emoji: '🚶',
    title: 'Choisir le bon équipement pour marcher',
    duree: '5 min',
    color: '#294e46',
    bg: '#edf5f1',
    border: '#c6ddd7',
    intro: 'Canne, déambulateur, rollator... Chaque aide à la marche correspond à une situation différente. Voici comment s\'y retrouver.',
    points: [
      { label: 'La canne simple', text: 'Idéale si vous avez une légère instabilité ou récupérez d\'une opération. Elle soutient d\'un côté et s\'utilise du côté opposé à la jambe qui pose problème.' },
      { label: 'Le déambulateur', text: 'Un cadre métallique léger avec 4 pieds que vous soulevez à chaque pas. Il offre un appui solide sur les deux côtés, parfait si les deux jambes sont moins solides.' },
      { label: 'Le rollator (déambulateur à roulettes)', text: 'Comme un déambulateur, mais avec des roues — vous poussez plutôt que soulever. Plus confortable pour les longues distances. La plupart ont un siège intégré pour se reposer.' },
      { label: 'Comment choisir ?', text: 'Demandez conseil à votre médecin ou à votre pharmacien. Ils peuvent vous faire essayer les équipements avant d\'acheter.' },
    ],
  },
  {
    emoji: '🏥',
    title: 'Préparer le retour à domicile après une hospitalisation',
    duree: '6 min',
    color: '#e97123',
    bg: '#fff2e9',
    border: '#f2dac7',
    intro: 'Une sortie d\'hôpital bien préparée évite les ré-hospitalisations. Voici les étapes essentielles.',
    points: [
      { label: 'Anticipez avant la sortie', text: 'Demandez à rencontrer l\'assistante sociale de l\'hôpital. Elle peut organiser des aides à domicile, un lit médicalisé ou d\'autres équipements avant votre retour.' },
      { label: 'Adaptez le logement rapidement', text: 'Barres d\'appui dans la salle de bain, enlever les tapis qui glissent, dégager les passages — ces petits aménagements font une grande différence.' },
      { label: 'Organisez l\'aide humaine', text: 'Aide à domicile, infirmier(ère) libéral(e), auxiliaire de vie... Votre médecin peut prescrire certains soins. La famille peut aussi être aidée par des structures de répit.' },
      { label: 'Le matériel médical', text: 'Votre pharmacien LGm@d peut livrer le matériel avant votre retour et vous l\'installer. Certains équipements nécessitent une ordonnance, préparez-la à l\'avance.' },
    ],
  },
  {
    emoji: '💤',
    title: 'Bien dormir malgré la douleur ou la mobilité réduite',
    duree: '4 min',
    color: '#7c3aed',
    bg: '#f3effe',
    border: '#d4c5f9',
    intro: 'Le manque de sommeil aggrave la douleur et ralentit la récupération. Des solutions simples existent.',
    points: [
      { label: 'Le matelas anti-escarres', text: 'Si vous restez beaucoup allongé, un matelas à mémoire de forme ou à air prévient les plaies de pression (escarres). Remboursable sur prescription médicale dans certains cas.' },
      { label: 'Le lit médicalisé', text: 'Un lit réglable en hauteur et inclinaison facilite les transferts (se lever, se coucher) et permet de trouver la position la plus confortable. Il peut être loué ou acheté.' },
      { label: 'Les barrières et lève-personnes', text: 'Des barrières latérales empêchent les chutes nocturnes. Un lève-personne permet de se lever sans effort si les jambes sont très affaiblies.' },
      { label: 'L\'entourage aussi a besoin de sommeil', text: 'Si vous aidez un proche, pensez à demander des solutions de relève (gardes de nuit, hébergement temporaire) pour ne pas vous épuiser.' },
    ],
  },
  {
    emoji: '🤝',
    title: 'Les conseils pour les aidants familiaux',
    duree: '5 min',
    color: '#d9534f',
    bg: '#fef2f2',
    border: '#fdc5c5',
    intro: 'Aider un proche est un acte magnifique mais exigeant. Voici comment prendre soin de vous aussi.',
    points: [
      { label: 'Reconnaître les limites', text: 'L\'épuisement de l\'aidant est réel et fréquent. Il est normal de se sentir dépassé. Demander de l\'aide n\'est pas abandonner votre proche.' },
      { label: 'Le congé de proche aidant', text: 'Si vous travaillez, vous avez droit à un congé de proche aidant (3 mois renouvelable jusqu\'à 1 an sur toute la carrière) indemnisé partiellement par la CAF.' },
      { label: 'Les solutions de répit', text: 'Accueil de jour, hébergement temporaire en EHPAD, garde à domicile... Ces solutions permettent de souffler quelques heures ou quelques jours.' },
      { label: 'Les groupes de soutien', text: 'Rencontrer d\'autres aidants aide à ne pas se sentir seul. Des associations locales proposent des groupes de parole gratuits. Votre CCAS ou CLIC local peut vous orienter.' },
    ],
  },
  {
    emoji: '🏠',
    title: 'Aménager son logement : les aides financières disponibles',
    duree: '5 min',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    intro: 'Adapter son logement peut représenter un coût important. Heureusement, plusieurs aides existent pour financer ces travaux.',
    points: [
      { label: 'MaPrimeAdapt\' (ANAH)', text: 'L\'Agence Nationale de l\'Habitat finance jusqu\'à 70 % des travaux d\'adaptation du logement pour les personnes en perte d\'autonomie. Douche italienne, monte-escalier, rampe d\'accès...' },
      { label: 'L\'APA pour les travaux', text: 'L\'Allocation Personnalisée d\'Autonomie (pour les 60 ans et plus) peut également financer des petits travaux d\'adaptation dans certains départements.' },
      { label: 'La PCH Aide technique', text: 'La Prestation de Compensation du Handicap peut financer des équipements techniques spécifiques (fauteuil roulant électrique, etc.).' },
      { label: 'Par où commencer ?', text: 'Contactez votre CCAS (mairie) ou le numéro national pour l\'autonomie : 3977. Ils vous orientent vers les aides disponibles dans votre département.' },
    ],
  },
];

export default function ConseilsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/particulier" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#53636e', textDecoration: 'none', marginBottom: '16px' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#17212b', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
          Conseils pratiques
        </h1>
        <p style={{ fontSize: '17px', color: '#53636e', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
          Des fiches rédigées simplement pour vous aider à prendre les bonnes décisions au bon moment.
        </p>
      </div>

      {/* Grille fiches */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {FICHES.map((fiche, idx) => (
          <details
            key={idx}
            style={{
              borderRadius: '20px',
              background: '#fff',
              border: `1px solid ${fiche.border}`,
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(23,33,43,0.05)',
            }}
          >
            <summary style={{
              padding: '20px 24px',
              background: fiche.bg,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              listStyle: 'none',
              userSelect: 'none',
            }}>
              <span style={{ fontSize: '26px', flexShrink: 0 }}>{fiche.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: fiche.color }}>{fiche.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#7aa087', fontWeight: 600 }}>Lecture : {fiche.duree}</p>
              </div>
              <span style={{ fontSize: '20px', color: fiche.color, flexShrink: 0 }}>▾</span>
            </summary>

            <div style={{ padding: '24px', borderTop: `1px solid ${fiche.border}` }}>
              <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#41525d', lineHeight: 1.65, fontStyle: 'italic' }}>
                {fiche.intro}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {fiche.points.map((point, j) => (
                  <div key={j} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: fiche.color, flexShrink: 0, marginTop: '8px' }} />
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#17212b' }}>{point.label}</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#53636e', lineHeight: 1.6 }}>{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${fiche.border}` }}>
                <Link href="/particulier/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: fiche.color, textDecoration: 'none' }}>
                  💬 Poser une question à Hellia sur ce sujet →
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>

    </div>
  );
}
