// Product data types and mock data
export interface Product {
  reference: string
  nom: string
  categorie: string
  description: string
  pointsForts: string[]
  prixTTC: number
  baseLPPR: number
  codeLPPR: string
  badges: ('vente' | 'location' | 'prestataire')[]
  recommande: boolean
  caracteristiques: Record<string, string>
  documents: { nom: string; url: string }[]
  imageUrl?: string
  // AI-enriched fields
  argumentaireVente?: string
  usageMedical?: string
  profilsPatients?: string[]
  conseilsUtilisation?: string[]
  caracteristiquesIA?: Record<string, string>
  motExpert?: string
  libellePrescription?: string
  documentsIA?: { nom: string; url: string }[]
}

export interface Pathway {
  slug: string
  nom: string
  description: string
  icon: string
  productCount: number
  isPro?: boolean
  comingSoon?: boolean
}

export interface KPI {
  label: string
  value: string
  trend?: string
  trendPositive?: boolean
}

export interface ActionMetric {
  label: string
  value: number
  hasAlert?: boolean
  hasNotification?: boolean
}

// Mock products data
export const products: Product[] = [
  {
    reference: 'DEA-001',
    nom: 'Déambulateur pliant 4 roues Premium',
    categorie: 'Aide à la marche',
    description: 'Déambulateur léger et robuste avec système de pliage facile. Idéal pour les déplacements intérieurs et extérieurs. Structure en aluminium anodisé garantissant durabilité et légèreté.',
    pointsForts: [
      'Pliage compact en une seule main',
      'Freins ergonomiques sécurisés',
      'Siège intégré avec rangement',
      'Hauteur ajustable 80-95cm'
    ],
    prixTTC: 189.90,
    baseLPPR: 54.36,
    codeLPPR: '1245978',
    badges: ['vente', 'location'],
    recommande: true,
    caracteristiques: {
      'Poids': '6.8 kg',
      'Capacité de charge': '130 kg',
      'Largeur assise': '45 cm',
      'Diamètre roues': '20 cm',
      'Matériau': 'Aluminium anodisé'
    },
    documents: [
      { nom: 'Notice d\'utilisation', url: '/documents/dea-001-notice.pdf' },
      { nom: 'Fiche technique', url: '/documents/dea-001-fiche.pdf' }
    ],
    argumentaireVente: 'Ce déambulateur représente l\'équilibre parfait entre sécurité et autonomie. Son design élégant et discret favorise l\'acceptation par le patient, tandis que ses caractéristiques techniques répondent aux exigences les plus strictes. Le système de pliage breveté permet un rangement facile, même pour les personnes à mobilité réduite.',
    usageMedical: 'Indiqué pour les patients présentant des troubles de l\'équilibre, une faiblesse musculaire des membres inférieurs, ou nécessitant un appui lors de la marche. Particulièrement adapté aux phases de rééducation post-opératoire et aux pathologies neurologiques légères à modérées.',
    profilsPatients: [
      'Personnes âgées en perte d\'autonomie (GIR 3-5)',
      'Patients en rééducation post-chirurgie orthopédique',
      'Personnes atteintes de pathologies neurologiques légères'
    ],
    conseilsUtilisation: [
      'Ajuster la hauteur pour que les poignées arrivent au niveau des hanches',
      'Vérifier le serrage des freins avant chaque utilisation',
      'Utiliser sur surfaces planes et dégagées',
      'Ne pas dépasser la charge maximale indiquée'
    ],
    caracteristiquesIA: {
      'Autonomie recommandée': 'GIR 3-5',
      'Usage': 'Intérieur/Extérieur',
      'Facilité de pliage': 'Excellent',
      'Stabilité': 'Très bonne'
    },
    motExpert: 'En 20 ans de pratique, ce modèle reste ma référence. La qualité de fabrication et l\'ergonomie des freins en font un choix sûr pour la grande majorité des patients. Je le recommande particulièrement pour les sorties en extérieur grâce à ses grandes roues.',
    libellePrescription: 'Déambulateur à 4 roues avec siège et panier, hauteur réglable, freins à poignées. LPPR 1245978.',
    documentsIA: [
      { nom: 'Guide de prescription', url: '/documents/dea-001-prescription.pdf' },
      { nom: 'Comparatif produits', url: '/documents/dea-001-comparatif.pdf' }
    ]
  },
  {
    reference: 'LIT-002',
    nom: 'Lit médicalisé électrique 3 fonctions',
    categorie: 'La chambre',
    description: 'Lit médicalisé à hauteur variable avec relève-buste et relève-jambes électriques. Télécommande filaire intuitive incluse.',
    pointsForts: [
      'Hauteur variable 40-80 cm',
      '3 moteurs silencieux',
      'Barrières amovibles incluses',
      'Roulettes avec frein central'
    ],
    prixTTC: 1890.00,
    baseLPPR: 1148.64,
    codeLPPR: '1246789',
    badges: ['vente', 'location', 'prestataire'],
    recommande: true,
    caracteristiques: {
      'Dimensions couchage': '90 x 200 cm',
      'Poids max patient': '135 kg',
      'Nombre de moteurs': '3',
      'Alimentation': '220V'
    },
    documents: [
      { nom: 'Notice technique', url: '/documents/lit-002-notice.pdf' }
    ],
    argumentaireVente: 'Solution complète pour le maintien à domicile, ce lit médicalisé offre confort et sécurité optimaux. Son fonctionnement silencieux préserve le sommeil du patient et de l\'aidant.',
    usageMedical: 'Recommandé pour les patients alités de façon prolongée, les personnes en perte d\'autonomie nécessitant une aide aux transferts, et la prévention des escarres.',
    profilsPatients: [
      'Patients en soins palliatifs',
      'Personnes âgées dépendantes (GIR 1-3)',
      'Patients post-AVC'
    ],
    conseilsUtilisation: [
      'Régler la hauteur pour faciliter les transferts',
      'Utiliser les barrières pendant le sommeil',
      'Vérifier régulièrement le bon fonctionnement des moteurs'
    ],
    motExpert: 'Le choix du lit médicalisé est crucial pour la qualité de vie du patient. Ce modèle offre le meilleur rapport qualité-fonctionnalités du marché.',
    libellePrescription: 'Lit médicalisé électrique à hauteur variable, 3 fonctions motorisées. LPPR 1246789.'
  },
  {
    reference: 'FTR-003',
    nom: 'Fauteuil roulant léger Alu Confort',
    categorie: 'Fauteuils roulants',
    description: 'Fauteuil roulant manuel ultraléger en aluminium. Dossier inclinable et accoudoirs escamotables pour faciliter les transferts.',
    pointsForts: [
      'Poids plume : 12 kg',
      'Pliage rapide',
      'Accoudoirs escamotables',
      'Repose-pieds amovibles'
    ],
    prixTTC: 459.00,
    baseLPPR: 395.09,
    codeLPPR: '1247890',
    badges: ['vente', 'location'],
    recommande: false,
    caracteristiques: {
      'Largeur assise': '43 cm',
      'Poids': '12 kg',
      'Capacité': '120 kg',
      'Diamètre roues arrière': '60 cm'
    },
    documents: [],
    argumentaireVente: 'Alliant légèreté et robustesse, ce fauteuil facilite le quotidien des patients et des aidants.',
    usageMedical: 'Adapté aux déplacements courts et moyens, intérieurs et extérieurs.',
    profilsPatients: [
      'Patients à mobilité réduite temporaire ou permanente',
      'Personnes âgées ne pouvant plus marcher'
    ],
    conseilsUtilisation: [
      'Vérifier le gonflage des pneus régulièrement',
      'Bloquer les freins lors des transferts'
    ],
    motExpert: 'Un excellent choix pour un premier équipement. La légèreté facilite grandement les sorties.'
  },
  {
    reference: 'SDB-004',
    nom: 'Siège de douche mural rabattable',
    categorie: 'Salle de bain',
    description: 'Siège de douche fixation murale, rabattable automatiquement. Surface antidérapante et structure inox.',
    pointsForts: [
      'Rabattement automatique',
      'Surface antidérapante',
      'Inox anti-corrosion',
      'Installation facile'
    ],
    prixTTC: 129.00,
    baseLPPR: 39.14,
    codeLPPR: '1248901',
    badges: ['vente'],
    recommande: true,
    caracteristiques: {
      'Dimensions assise': '38 x 35 cm',
      'Charge max': '150 kg',
      'Matériau': 'Inox / ABS'
    },
    documents: [
      { nom: 'Guide de pose', url: '/documents/sdb-004-pose.pdf' }
    ],
    argumentaireVente: 'Sécurisez la douche de vos patients avec ce siège robuste et discret.',
    usageMedical: 'Prévention des chutes lors de la toilette.',
    profilsPatients: ['Personnes âgées', 'Patients post-opératoires'],
    conseilsUtilisation: ['Vérifier la solidité de la fixation murale'],
    motExpert: 'Indispensable pour sécuriser la salle de bain.'
  },
  {
    reference: 'TOI-005',
    nom: 'Rehausseur WC avec accoudoirs',
    categorie: 'Toilettes',
    description: 'Rehausseur de toilettes avec accoudoirs rabattables. Hauteur 10 cm. Fixation sécurisée sur la cuvette.',
    pointsForts: [
      'Accoudoirs rembourrés',
      'Fixation universelle',
      'Nettoyage facile',
      'Hauteur optimale 10 cm'
    ],
    prixTTC: 79.90,
    baseLPPR: 25.00,
    codeLPPR: '1249012',
    badges: ['vente'],
    recommande: false,
    caracteristiques: {
      'Hauteur rehausse': '10 cm',
      'Charge max': '130 kg',
      'Matériau': 'Polypropylène'
    },
    documents: [],
    argumentaireVente: 'Facilitez l\'usage des toilettes et préservez l\'autonomie.',
    usageMedical: 'Recommandé pour les difficultés à s\'asseoir et se relever.',
    profilsPatients: ['Personnes âgées', 'Patients arthrosiques'],
    conseilsUtilisation: ['Vérifier la compatibilité avec la cuvette'],
    motExpert: 'Simple mais essentiel pour de nombreux patients.'
  },
  {
    reference: 'AID-006',
    nom: 'Pince de préhension pliable 82cm',
    categorie: 'Aides techniques',
    description: 'Pince de préhension ergonomique avec aimant intégré. Longueur 82 cm. Pliable pour le transport.',
    pointsForts: [
      'Aimant intégré',
      'Poignée ergonomique',
      'Pliable',
      'Légère : 180g'
    ],
    prixTTC: 24.90,
    baseLPPR: 0,
    codeLPPR: '',
    badges: ['vente'],
    recommande: true,
    caracteristiques: {
      'Longueur': '82 cm',
      'Poids': '180 g',
      'Capacité prise': '2 kg'
    },
    documents: [],
    argumentaireVente: 'Outil indispensable pour préserver l\'autonomie au quotidien.',
    usageMedical: 'Aide à la préhension pour éviter les flexions et les risques de chute.',
    profilsPatients: ['Personnes âgées', 'Patients avec limitations de mobilité'],
    conseilsUtilisation: ['Ne pas dépasser la charge recommandée'],
    motExpert: 'Un petit investissement pour un grand gain d\'autonomie.'
  }
]

// Care pathways
export const pathways: Pathway[] = [
  {
    slug: 'aide-marche',
    nom: 'Aide à la marche',
    description: 'Cannes, déambulateurs, rollators et accessoires',
    icon: 'walking-cane',
    productCount: 48
  },
  {
    slug: 'chambre',
    nom: 'La chambre',
    description: 'Lits médicalisés, matelas, accessoires de lit',
    icon: 'bed',
    productCount: 67
  },
  {
    slug: 'fauteuils',
    nom: 'Fauteuils roulants',
    description: 'Fauteuils manuels, électriques et accessoires',
    icon: 'wheelchair',
    productCount: 89
  },
  {
    slug: 'salle-de-bain',
    nom: 'Salle de bain',
    description: 'Sièges de douche, barres d\'appui, tapis',
    icon: 'shower',
    productCount: 124
  },
  {
    slug: 'toilettes',
    nom: 'Toilettes',
    description: 'Rehausseurs, cadres, chaises percées',
    icon: 'toilet',
    productCount: 45
  },
  {
    slug: 'aides-techniques',
    nom: 'Aides techniques',
    description: 'Pinces, enfile-bas, aides au quotidien',
    icon: 'tools',
    productCount: 156
  }
]

// Pro pathways (coming soon)
export const proPathways: Pathway[] = [
  {
    slug: 'soins-domicile',
    nom: 'Soins à domicile',
    description: 'Équipements pour les soins infirmiers',
    icon: 'medical',
    productCount: 0,
    isPro: true,
    comingSoon: true
  },
  {
    slug: 'reeducation',
    nom: 'Rééducation',
    description: 'Matériel de rééducation fonctionnelle',
    icon: 'rehabilitation',
    productCount: 0,
    isPro: true,
    comingSoon: true
  },
  {
    slug: 'cabinet-medical',
    nom: 'Cabinet médical',
    description: 'Équipements pour professionnels de santé',
    icon: 'clinic',
    productCount: 0,
    isPro: true,
    comingSoon: true
  }
]

// Dashboard KPIs
export const dashboardKPIs: KPI[] = [
  { label: 'CA HT total', value: '128 450 €', trend: '+8%', trendPositive: true },
  { label: 'CA Ventes', value: '82 300 €', trend: '+12%', trendPositive: true },
  { label: 'CA Locations', value: '46 150 €', trend: '+3%', trendPositive: true },
  { label: 'Marge HT', value: '8%', trend: '+1pt', trendPositive: true }
]

// Action metrics
export const actionMetrics: ActionMetric[] = [
  { label: 'Devis en attente', value: 7 },
  { label: 'Commandes bloquées', value: 3, hasAlert: true },
  { label: 'Commandes en cours', value: 12 },
  { label: 'Clients actifs', value: 213 },
  { label: 'Catalogues fournisseurs', value: 4 },
  { label: 'Formations nouvelles', value: 2, hasNotification: true }
]

// Management cards
export const managementCards = [
  {
    id: 'clients',
    titre: 'Clients',
    description: 'Dossiers, historique, suivi',
    icon: 'users',
    hasNotification: true
  },
  {
    id: 'commandes',
    titre: 'Commandes',
    description: 'Suivi, traitement, livraisons',
    icon: 'package',
    alertBadge: '3 commandes bloquées'
  },
  {
    id: 'catalogues',
    titre: 'Catalogues',
    description: 'Offres, tarifs HT, références',
    icon: 'book'
  },
  {
    id: 'formations',
    titre: 'Formations',
    description: 'Modules, programmes, suivi',
    icon: 'graduation',
    hasNotification: true
  },
  {
    id: 'ressources',
    titre: 'Ressources',
    description: 'Documents, contenus métier',
    icon: 'folder'
  }
]

// Expert articles
export const expertArticles = [
  {
    slug: 'prevention-chute',
    titre: 'Prévention des chutes',
    extrait: 'Les chutes représentent la première cause d\'accident domestique chez les seniors...',
    imageUrl: ''
  },
  {
    slug: 'autonomie-salle-de-bain',
    titre: 'Autonomie salle de bain',
    extrait: 'Adapter la salle de bain est essentiel pour maintenir l\'autonomie...',
    imageUrl: ''
  },
  {
    slug: 'mobilite',
    titre: 'Mobilité et déplacements',
    extrait: 'Choisir le bon équipement de mobilité selon le profil du patient...',
    imageUrl: ''
  },
  {
    slug: 'adaptation-domicile',
    titre: 'Adaptation du domicile',
    extrait: 'Guide complet pour adapter le domicile aux besoins de la personne âgée...',
    imageUrl: ''
  }
]

// Tool cards
export const toolCards = [
  {
    id: 'questionnaires',
    titre: 'Questionnaires autonomie',
    description: 'Évaluez le niveau d\'autonomie de vos patients',
    icon: 'clipboard-check'
  },
  {
    id: 'parcours',
    titre: 'Parcours conseils',
    description: 'Guides de conseil par thématique',
    icon: 'map'
  },
  {
    id: 'guides',
    titre: 'Guides autonomie',
    description: 'Documentation sur les aides disponibles',
    icon: 'book-open'
  },
  {
    id: 'contenus',
    titre: 'Contenus patient',
    description: 'Fiches à remettre à vos patients',
    icon: 'file-text'
  }
]

// Questionnaire steps
export const questionnaireSteps = [
  {
    id: 1,
    question: 'Comment le patient se déplace-t-il habituellement ?',
    options: [
      { id: 'a', label: 'Sans aide', value: 4 },
      { id: 'b', label: 'Avec une canne ou un appui', value: 3 },
      { id: 'c', label: 'Avec un déambulateur', value: 2 },
      { id: 'd', label: 'En fauteuil roulant ou aide constante', value: 1 }
    ]
  },
  {
    id: 2,
    question: 'Comment le patient gère-t-il sa toilette quotidienne ?',
    options: [
      { id: 'a', label: 'De manière totalement autonome', value: 4 },
      { id: 'b', label: 'Avec une aide partielle', value: 3 },
      { id: 'c', label: 'Avec une aide importante', value: 2 },
      { id: 'd', label: 'Dépendance totale', value: 1 }
    ]
  },
  {
    id: 3,
    question: 'Comment se passent les transferts (lit, fauteuil, WC) ?',
    options: [
      { id: 'a', label: 'Sans aucune difficulté', value: 4 },
      { id: 'b', label: 'Avec quelques difficultés', value: 3 },
      { id: 'c', label: 'Nécessite une aide régulière', value: 2 },
      { id: 'd', label: 'Impossible sans aide', value: 1 }
    ]
  },
  {
    id: 4,
    question: 'Comment le patient s\'habille-t-il ?',
    options: [
      { id: 'a', label: 'Complètement seul', value: 4 },
      { id: 'b', label: 'Aide pour certains vêtements', value: 3 },
      { id: 'c', label: 'Aide importante nécessaire', value: 2 },
      { id: 'd', label: 'Dépendance totale', value: 1 }
    ]
  },
  {
    id: 5,
    question: 'Comment se passent les repas ?',
    options: [
      { id: 'a', label: 'Mange seul sans aide', value: 4 },
      { id: 'b', label: 'Aide pour couper les aliments', value: 3 },
      { id: 'c', label: 'Doit être accompagné', value: 2 },
      { id: 'd', label: 'Alimentation assistée', value: 1 }
    ]
  },
  {
    id: 6,
    question: 'Comment est la continence du patient ?',
    options: [
      { id: 'a', label: 'Continent', value: 4 },
      { id: 'b', label: 'Incontinence occasionnelle', value: 3 },
      { id: 'c', label: 'Incontinence fréquente', value: 2 },
      { id: 'd', label: 'Incontinent', value: 1 }
    ]
  },
  {
    id: 7,
    question: 'Comment le patient gère-t-il son orientation dans le temps ?',
    options: [
      { id: 'a', label: 'Parfaitement orienté', value: 4 },
      { id: 'b', label: 'Quelques confusions', value: 3 },
      { id: 'c', label: 'Désorienté fréquemment', value: 2 },
      { id: 'd', label: 'Totalement désorienté', value: 1 }
    ]
  },
  {
    id: 8,
    question: 'Comment le patient communique-t-il ?',
    options: [
      { id: 'a', label: 'Communication normale', value: 4 },
      { id: 'b', label: 'Difficultés légères', value: 3 },
      { id: 'c', label: 'Difficultés importantes', value: 2 },
      { id: 'd', label: 'Communication impossible', value: 1 }
    ]
  },
  {
    id: 9,
    question: 'Le patient présente-t-il des troubles du comportement ?',
    options: [
      { id: 'a', label: 'Aucun trouble', value: 4 },
      { id: 'b', label: 'Troubles occasionnels', value: 3 },
      { id: 'c', label: 'Troubles fréquents', value: 2 },
      { id: 'd', label: 'Troubles permanents', value: 1 }
    ]
  }
]

// Helper to get product by reference
export function getProductByReference(reference: string): Product | undefined {
  return products.find(p => p.reference === reference)
}

// Helper to get products by category
export function getProductsByCategory(categorie: string): Product[] {
  return products.filter(p => p.categorie === categorie)
}

// Helper to get recommended products
export function getRecommendedProducts(): Product[] {
  return products.filter(p => p.recommande)
}

// Calculate GIR level from questionnaire score
export function calculateGIR(totalScore: number): { level: number; category: string; color: string } {
  if (totalScore >= 32) return { level: 6, category: 'fragile', color: 'gir-fragile' }
  if (totalScore >= 28) return { level: 5, category: 'fragile', color: 'gir-fragile' }
  if (totalScore >= 22) return { level: 4, category: 'moderate', color: 'gir-moderate' }
  if (totalScore >= 16) return { level: 3, category: 'moderate', color: 'gir-moderate' }
  if (totalScore >= 10) return { level: 2, category: 'severe', color: 'gir-severe' }
  return { level: 1, category: 'severe', color: 'gir-severe' }
}
