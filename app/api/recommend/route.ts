import { NextRequest, NextResponse } from 'next/server';
import { mistral, MISTRAL_EMBED_MODEL, MISTRAL_RECOMMEND_MODEL } from '@/lib/mistral';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildRecommendationPrompt } from '@/lib/prompts';
import { PatientProfile, GIRScore, Product, CategorieMAD } from '@/lib/types';
import { getCategoriesByGIR } from '@/lib/scoring';
import { extractJson } from '@/lib/parseJson';

export async function POST(req: NextRequest) {
  try {
    const { profil, gir }: { profil: PatientProfile; gir: GIRScore } = await req.json();

    // 1. Build semantic query from profile
    const queryText = buildSemanticQuery(profil, gir);

    // 2. Generate embedding for the query
    let candidateProduits: Product[] = [];

    try {
      const embedResponse = await mistral.embeddings.create({
        model: MISTRAL_EMBED_MODEL,
        inputs: [queryText],
      });
      const embedding = embedResponse.data[0].embedding;

      // 3. Semantic search in Supabase pgvector
      const validCategories: CategorieMAD[] = ['aide_marche','chambre','fauteuils','salle_de_bain','toilettes','aides_techniques','protections','soins','autre'];
      const categories = (profil.priorites?.length ? profil.priorites : getCategoriesByGIR(gir.niveau))
        .filter((c): c is CategorieMAD => validCategories.includes(c as CategorieMAD));

      const { data: vectorResults } = await getSupabaseAdmin().rpc('search_products', {
        query_embedding: embedding,
        match_count: 20,
        filter_categories: categories.length > 0 ? categories : null,
      });

      candidateProduits = vectorResults ?? [];
    } catch (vectorError) {
      console.warn('[recommend] Vector search failed, falling back to category search:', vectorError);

      // Fallback : recherche par catégorie (colonne `categorie` = snake_case, ex. 'aide_marche')
      const fallbackCategories = (profil.priorites?.length ? profil.priorites : getCategoriesByGIR(gir.niveau)) as string[];

      const { data: categoryResults } = await getSupabaseAdmin()
        .from('products')
        .select('reference, nom, description, categorie, prix_ttc, base_lppr, image_url')
        .in('categorie', fallbackCategories)
        .limit(20);

      candidateProduits = categoryResults ?? [];

      // Si toujours vide (catégories absentes ?), cherche par mots-clés ilike
      if (candidateProduits.length === 0) {
        const keywords = getPriorityKeywords(profil).slice(0, 3);
        if (keywords.length > 0) {
          const orFilter = keywords.map((kw) => `nom.ilike.%${kw}%`).join(',');
          const { data: kwResults } = await getSupabaseAdmin()
            .from('products')
            .select('reference, nom, description, categorie, prix_ttc, base_lppr, image_url')
            .or(orFilter)
            .limit(20);
          candidateProduits = kwResults ?? [];
        }
      }
    }

    if (candidateProduits.length === 0) {
      return NextResponse.json({ produits: [], justification: 'Aucun produit trouvé pour ce profil.' });
    }

    // 4. AI ranking of top candidates
    const rankingPrompt = buildRecommendationPrompt(profil, gir, candidateProduits);
    const FALLBACK_MODELS = ['mistral-small-latest', 'open-mistral-nemo'];

    let rankingResponse = null;
    for (const model of [MISTRAL_RECOMMEND_MODEL, ...FALLBACK_MODELS]) {
      try {
        rankingResponse = await mistral.chat.complete({
          model,
          messages: [{ role: 'user', content: rankingPrompt }],
          responseFormat: { type: 'json_object' },
          temperature: 0.2,
          maxTokens: 2500,
        });
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[recommend] ${model} failed (${msg.slice(0, 80)}), essai modèle suivant…`);
      }
    }

    // Si tous les modèles ont échoué, retourner les produits sans ranking IA
    if (!rankingResponse) {
      console.error('[recommend] Tous les modèles ont échoué — retour des produits bruts');
      const produitsBruts = candidateProduits.slice(0, 5).map((p, i) => ({
        ...p,
        justification: 'Produit sélectionné selon votre profil et vos priorités.',
        priorite: i + 1,
      }));
      return NextResponse.json({ produits: produitsBruts, messageGlobal: null, gir });
    }

    const rawContent = rankingResponse.choices?.[0]?.message?.content ?? '{}';
    const rankingContent = extractJson(typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent));

    let ranking: {
      recommandations: { reference: string; justification: string; priorite: number }[];
      messageGlobal: string;
    };

    try {
      ranking = JSON.parse(rankingContent);
      if (!Array.isArray(ranking.recommandations)) {
        throw new Error('recommandations is not an array');
      }
    } catch (parseError) {
      console.error('[recommend] JSON parse error:', parseError, 'Raw content:', rawContent);
      // Fallback : retourner les produits bruts plutôt qu'une erreur 500
      const produitsBruts = candidateProduits.slice(0, 5).map((p, i) => ({
        ...p,
        justification: 'Produit sélectionné selon votre profil et vos priorités.',
        priorite: i + 1,
      }));
      return NextResponse.json({ produits: produitsBruts, messageGlobal: null, gir });
    }

    // 5. Merge with full product data
    const produitsFinals = ranking.recommandations
      .map((r) => {
        const produit = candidateProduits.find((p) => p.reference === r.reference);
        if (!produit) return null;
        return { ...produit, justification: r.justification, priorite: r.priorite };
      })
      .filter(Boolean);

    return NextResponse.json({
      produits: produitsFinals,
      messageGlobal: ranking.messageGlobal,
      gir,
    });
  } catch (error) {
    console.error('[recommend] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération des recommandations' }, { status: 500 });
  }
}

function buildSemanticQuery(profil: PatientProfile, gir: GIRScore): string {
  const parts: string[] = [];

  parts.push(`Patient GIR ${gir.niveau}`);

  if (profil.age) parts.push(`âgé de ${profil.age} ans`);

  const mobiliteLabels = ['marche sans difficulté', 'marche difficile', 'besoin d\'aide à la marche', 'fauteuil ou alité'];
  if (profil.mobilite !== undefined) parts.push(mobiliteLabels[profil.mobilite]);

  if (profil.elimination && profil.elimination >= 2) parts.push('protections urinaires');

  const priorities = profil.priorites
    ?.map((p) => {
      const labels: Record<string, string> = {
        aide_marche: 'aide à la marche canne déambulateur rollator',
        chambre: 'lit médicalisé confort chambre',
        fauteuils: 'fauteuil roulant mobilité assistée',
        salle_de_bain: 'barre appui siège douche baignoire sécurité',
        toilettes: 'réhausseur WC barres appui toilettes',
        aides_techniques: 'aides techniques gestes quotidien ergonomie',
      };
      return labels[p] ?? p;
    })
    .join(' ');

  if (priorities) parts.push(priorities);

  return parts.join('. ');
}

function getPriorityKeywords(profil: PatientProfile): string[] {
  const keywordMap: Record<string, string[]> = {
    aide_marche: ['canne', 'rollator', 'déambulateur', 'béquille'],
    chambre: ['lit', 'matelas', 'coussin', 'escarres'],
    fauteuils: ['fauteuil'],
    salle_de_bain: ['barre', 'siège', 'douche', 'baignoire'],
    toilettes: ['réhausseur', 'WC'],
    aides_techniques: ['aide', 'ergonomique', 'adaptée'],
  };

  return profil.priorites?.flatMap((p) => keywordMap[p] ?? []) ?? ['aide'];
}
