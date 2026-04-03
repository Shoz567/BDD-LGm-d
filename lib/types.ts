// Types partagés pour l'application LGm@d
// Version 2.0 — Aligné sur la grille AGGIR (10 variables discriminantes)

export interface PatientProfile {
  respondant: 'patient' | 'aidant';
  age: '<60' | '60-70' | '71-80' | '81-90' | '90+';
  sexe: 'femme' | 'homme';

  // === Variables AGGIR discriminantes ===

  /** Cohérence — Communiquer et se comporter de façon sensée */
  coherence: 0 | 1 | 2; // 0=cohérent, 1=parfois incohérent, 2=très incohérent/confusion

  /** Orientation — Se repérer dans le temps et les lieux */
  orientation: 0 | 1 | 2; // 0=orienté, 1=parfois désorienté, 2=désorienté

  /** Toilette corporelle — Se laver seul */
  toilette: 0 | 1 | 2; // 0=seul, 1=aide partielle, 2=aide totale

  /** Habillage — S'habiller/se déshabiller */
  habillage: 0 | 1 | 2; // 0=seul, 1=aide partielle, 2=aide totale

  /** Alimentation — Manger les aliments préparés */
  alimentation: 0 | 1 | 2; // 0=seul, 1=aide pour couper/préparer, 2=aide pour manger

  /** Élimination — Hygiène urinaire/fécale, continence */
  elimination: 0 | 1 | 2 | 3; // 0=continent, 1=accidents occasionnels, 2=protections autonome, 3=protections+aide

  /** Transferts — Se lever, se coucher, s'asseoir */
  transferts: 0 | 1 | 2; // 0=seul, 1=aide partielle, 2=aide totale

  /** Déplacements intérieurs */
  mobilite: 0 | 1 | 2 | 3; // 0=marche bien, 1=marche avec difficulté, 2=aide technique, 3=fauteuil/alité

  /** Déplacements extérieurs */
  deplacementExterieur: 0 | 1 | 2; // 0=sort seul, 1=accompagné seulement, 2=ne sort plus

  /** Communication à distance — Téléphone, alarme */
  communication: 0 | 1 | 2; // 0=utilise seul, 1=avec aide, 2=ne peut pas

  // === Facteurs aggravants ===
  situationRecente: 0 | 1 | 2 | 3; // 0=aucune, 1=chute, 2=hospitalisation, 3=perte autonomie progressive

  // === Priorités MAD déclarées ===
  priorites: PrioriteMAD[];

  // === Données complémentaires ===
  poids?: number;
  taille?: number;
  pathologies?: string[];
  ordonnance?: OrdonnanceData;
}

export type PrioriteMAD =
  | 'aide_marche'
  | 'chambre'
  | 'fauteuils'
  | 'salle_de_bain'
  | 'toilettes'
  | 'aides_techniques';

export interface OrdonnanceData {
  medicaments: string[];
  pathologies: string[];
  dispositifsMedicaux: string[];
  prescripteur?: string;
  date?: string;
  rawText?: string;
  notesMAD?: string;
}

export interface GIRScore {
  niveau: 1 | 2 | 3 | 4 | 5 | 6;
  scoreTotal: number;
  description: string;
  couleur: string;
  eligibleAPA: boolean;
  detailVariables?: Record<string, number>;
}

export interface Product {
  reference: string;
  nom: string;
  prix_ttc: number;
  base_lppr?: number;
  code_lppr?: string;
  categorie?: string;
  categorie_mad?: CategorieMAD;
  image_url?: string;
  pdf_url?: string;
  description?: string;
  points_forts?: string;
  expert?: string;
  specs?: string;
  recommande?: string;
  score_pertinence?: number;
  justification?: string;
  priorite?: number;
}

export type CategorieMAD =
  | 'aide_marche'
  | 'chambre'
  | 'fauteuils'
  | 'salle_de_bain'
  | 'toilettes'
  | 'aides_techniques'
  | 'protections'
  | 'soins'
  | 'autre';

export interface RecommendationResult {
  profil: PatientProfile;
  gir: GIRScore;
  produits: { categorie: CategorieMAD; produits: Product[] }[];
  justification: string;
}

export type ConversationStep =
  | 'welcome'
  | 'respondant'
  | 'age'
  | 'sexe'
  | 'coherence'
  | 'mobilite'
  | 'deplacement_ext'
  | 'transferts'
  | 'toilette'
  | 'habillage'
  | 'alimentation'
  | 'elimination'
  | 'communication'
  | 'situation'
  | 'priorites'
  | 'ordonnance'
  | 'analyse'
  | 'recommandations'
  | 'fin';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  quickActions?: QuickAction[];
  metadata?: {
    step?: ConversationStep;
    profilUpdate?: Partial<PatientProfile>;
    girScore?: GIRScore;
    produits?: Product[];
  };
}

export interface QuickAction {
  label: string;
  value: string;
  icon?: string;
}

// Personas démo
export interface DemoPersona {
  id: string;
  nom: string;
  age: string;
  girAttendu: number;
  scenario: string;
  profil: Partial<PatientProfile>;
  emoji: string;
}
