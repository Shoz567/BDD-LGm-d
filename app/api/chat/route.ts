import { NextRequest, NextResponse } from 'next/server';
import { mistral, MISTRAL_CHAT_MODEL, MISTRAL_GESTION_MODEL } from '@/lib/mistral';
import { buildSystemPrompt, PROMPT_GESTION, SYSTEM_KNOWLEDGE_GESTION, PROMPT_COMPTOIR_CHAT, isProductQuery, isProductQueryComptoir, formatProductContext, CatalogueProduct } from '@/lib/prompts';
import { calculerGIR } from '@/lib/scoring';
import { PatientProfile } from '@/lib/types';
import { extractJson } from '@/lib/parseJson';
import { fixQuickActionLabels } from '@/lib/quickActionLabels';
import { getSupabaseAdmin } from '@/lib/supabase';

// Mots vides français à exclure de la recherche catalogue
const STOP_WORDS = new Set([
  'le','la','les','de','du','des','un','une','et','en','au','aux',
  'je','tu','il','elle','nous','vous','ils','elles','me','te','se',
  'mon','ton','son','ma','ta','sa','nos','vos','leurs',
  'que','qui','quoi','dont','comment','pourquoi',
  'est','sont','avec','pour','sur','sous','par','dans','entre','vers',
  'plus','très','bien','aussi','même','tout','tous','toute','toutes',
  'avez','avez-vous','pouvez','faire','besoin','cherche',
  'voulez','souhaitez','chercher','trouver','voir','avoir',
  'pour','avec','sans','chez','mais','donc','alors','aussi',
]);

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlever accents pour comparaison
    .replace(/[?!.,;:'"()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
    .slice(0, 6);
}

async function searchCatalogue(query: string): Promise<CatalogueProduct[]> {
  if (query.trim().length < 3) return [];

  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  try {
    const seen = new Set<string>();
    const results: CatalogueProduct[] = [];

    // Chercher avec chaque mot-clé en parallèle puis fusionner
    const searches = await Promise.all(
      keywords.slice(0, 4).map(kw =>
        getSupabaseAdmin()
          .from('products')
          .select('reference, nom, categorie, prix_ttc, description')
          .or(`nom.ilike.%${kw}%,description.ilike.%${kw}%,reference.ilike.%${kw}%`)
          .limit(4)
      )
    );

    // Trier par pertinence : priorité aux produits qui matchent plusieurs mots-clés
    const counts = new Map<string, number>();
    const productMap = new Map<string, CatalogueProduct>();

    for (const { data } of searches) {
      for (const p of data ?? []) {
        counts.set(p.reference, (counts.get(p.reference) ?? 0) + 1);
        productMap.set(p.reference, p as CatalogueProduct);
      }
    }

    // Trier par nombre de mots-clés matchés (descend)
    const sorted = [...productMap.values()].sort(
      (a, b) => (counts.get(b.reference) ?? 0) - (counts.get(a.reference) ?? 0)
    );

    for (const p of sorted) {
      if (!seen.has(p.reference) && results.length < 6) {
        seen.add(p.reference);
        results.push(p);
      }
    }

    return results;
  } catch {
    return [];
  }
}

// ─── Mode Comptoir ────────────────────────────────────────────────────────────

async function handleComptoir(req: NextRequest): Promise<NextResponse> {
  const { messages, profil }: { messages: { role: string; content: string }[]; profil: Partial<PatientProfile> } =
    await req.json();

  const gir = Object.keys(profil).length >= 4 ? calculerGIR(profil) : undefined;
  const systemPrompt = buildSystemPrompt(profil, gir);

  const FALLBACK_MODELS = ['mistral-small-latest', 'open-mistral-nemo'];
  const chatParams = {
    messages: [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-12).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
    responseFormat: { type: 'json_object' as const },
    temperature: 0.3,
    maxTokens: 400,
  };

  const is503 = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes('503') || msg.includes('overflow') || msg.includes('Service unavailable');
  };

  let response;
  try {
    response = await mistral.chat.complete({ model: MISTRAL_CHAT_MODEL, ...chatParams });
  } catch (err: unknown) {
    if (!is503(err)) throw err;
    let lastErr = err;
    for (const fallback of FALLBACK_MODELS) {
      try {
        console.warn(`[chat/comptoir] fallback vers ${fallback}`);
        response = await mistral.chat.complete({ model: fallback, ...chatParams });
        break;
      } catch (fallbackErr: unknown) {
        if (!is503(fallbackErr)) throw fallbackErr;
        lastErr = fallbackErr;
      }
    }
    if (!response) throw lastErr;
  }

  const rawContent = response.choices?.[0]?.message?.content ?? '{}';
  const content = extractJson(typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent));

  let parsed: {
    message?: string;
    step?: string;
    profilUpdate?: Partial<PatientProfile>;
    quickActions?: { label: string; value: string }[];
    isComplete?: boolean;
  };

  try {
    parsed = JSON.parse(content);
  } catch {
    console.error('[chat/comptoir] JSON parse failed, raw:', rawContent);
    return NextResponse.json(
      { message: 'Désolé, une erreur de traitement est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }

  // Garde-fou : si le message ne contient pas de question et que l'entretien n'est pas terminé,
  // on injecte la question canonique du step pour éviter les messages de transition sans question.
  const STEP_QUESTIONS: Record<string, string> = {
    respondant: 'Répondez-vous pour vous-même ou pour un proche ?',
    age: 'Quel est votre âge ?',
    sexe: 'Êtes-vous un homme ou une femme ?',
    coherence: 'La lucidité est-elle toujours présente ?',
    mobilite: 'Comment se passent les déplacements à l\'intérieur ?',
    deplacementExterieur: 'Et pour les sorties extérieures ?',
    transferts: 'Pour se lever et s\'asseoir, y a-t-il besoin d\'aide ?',
    toilette: 'Et pour la toilette ?',
    habillage: 'Et pour s\'habiller ?',
    alimentation: 'Et pour les repas ?',
    elimination: 'Y a-t-il des difficultés pour la continence ?',
    communication: 'Peut-il/elle utiliser le téléphone seul(e) ?',
    situationRecente: 'Y a-t-il eu un événement récent (chute, hospitalisation) ?',
    priorites: 'Quels sont vos besoins prioritaires en équipement ?',
    ordonnance: 'Avez-vous une ordonnance médicale ?',
  };

  if (!parsed.isComplete && parsed.message) {
    // Si le message ne contient pas de question, injecter la question canonique du step
    if (!parsed.message.includes('?')) {
      const fallbackQuestion = STEP_QUESTIONS[parsed.step ?? ''];
      if (fallbackQuestion) {
        parsed.message = fallbackQuestion;
      }
    } else {
      // Si le message contient une question mais aussi des phrases de remplissage inutiles,
      // ne garder que la dernière phrase (qui contient le "?")
      const FILLER_PATTERNS = [
        /^(merci (pour (cette|votre|ces)|beaucoup)[^.!?]*[.!]?\s*)/i,
        /^(très bien[^.!?]*[.!]?\s*)/i,
        /^(d'accord[^.!?]*[.!]?\s*)/i,
        /^(je (comprends|vois|note)[^.!?]*[.!]?\s*)/i,
        /^(votre .+ (est|sont) (donc |bien )?.+[.!]\s*)/i,
      ];

      let cleaned = parsed.message.trim();
      for (const pattern of FILLER_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
      }
      // Si après nettoyage il reste une question valide, l'utiliser
      if (cleaned.includes('?') && cleaned.trim().length > 5) {
        parsed.message = cleaned.trim();
        // Capitaliser la première lettre
        parsed.message = parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1);
      }
    }
  }

  // Coercion des champs numériques AGGIR (le modèle peut renvoyer des strings)
  const NUMERIC_FIELDS = [
    'coherence','orientation','toilette','habillage','alimentation','elimination',
    'transferts','mobilite','deplacementExterieur','communication','situationRecente',
  ];
  const profilUpdate = parsed.profilUpdate ?? {};
  for (const field of NUMERIC_FIELDS) {
    if (field in profilUpdate && typeof (profilUpdate as Record<string, unknown>)[field] === 'string') {
      (profilUpdate as Record<string, unknown>)[field] = Number((profilUpdate as Record<string, unknown>)[field]);
    }
  }

  const updatedProfil = { ...profil, ...profilUpdate };
  const updatedGIR = Object.keys(updatedProfil).length >= 4 ? calculerGIR(updatedProfil) : undefined;

  return NextResponse.json({
    message: parsed.message ?? '',
    step: parsed.step,
    profilUpdate,
    quickActions: parsed.isComplete ? [] : fixQuickActionLabels(parsed.step, parsed.quickActions ?? []),
    isComplete: parsed.isComplete ?? false,
    gir: updatedGIR,
  });
}

// ─── Mode Gestion (streaming SSE) ────────────────────────────────────────────

interface PatientContext {
  id: string;
  prenom: string;
  nom: string;
  telephone?: string | null;
  email?: string | null;
  notes?: string | null;
  gir_niveau: number;
  gir_score?: number | null;
  gir_description?: string | null;
  gir_eligible_apa?: boolean;
  produits_recommandes?: { reference: string; nom: string; prix_ttc?: number | null; categorie?: string }[] | null;
  created_at?: string;
}

interface GestionContext {
  date?: string;
  pharmacie?: string;
  panier?: {
    articles: { reference: string; nom: string; quantite: number; prix_ttc: number | null; sous_total: number }[];
    nombre_articles: number;
    total_ttc: number;
  };
  patients?: PatientContext[];
}

function buildLiveContext(context: GestionContext): string {
  const lines: string[] = ['\n\n--- CONTEXTE EN DIRECT ---'];

  if (context.date) lines.push(`Date : ${context.date}`);
  if (context.pharmacie) lines.push(`Pharmacie connectée : ${context.pharmacie}`);

  if (context.panier) {
    const { articles, nombre_articles, total_ttc } = context.panier;
    if (nombre_articles === 0) {
      lines.push('\nPanier : vide (aucun article)');
    } else {
      lines.push(`\nPanier (${nombre_articles} article${nombre_articles > 1 ? 's' : ''}) :`);
      articles.forEach((a, i) => {
        const prix = a.prix_ttc != null ? `${a.prix_ttc.toFixed(2)} €` : 'prix inconnu';
        const sous = `${a.sous_total.toFixed(2)} €`;
        lines.push(`  ${i + 1}. ${a.nom} (réf. ${a.reference}) — qté ${a.quantite} × ${prix} = ${sous}`);
      });
      lines.push(`  Total TTC : ${total_ttc.toFixed(2)} €`);
    }
  }

  if (context.patients && context.patients.length > 0) {
    lines.push(`\nCLIENTS ENREGISTRÉS (${context.patients.length} patient${context.patients.length > 1 ? 's' : ''}) :`);
    context.patients.forEach((p, i) => {
      const date = p.created_at
        ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
      const apa = p.gir_eligible_apa ? ' — Éligible APA' : '';
      const nbProduits = p.produits_recommandes?.length ?? 0;
      lines.push(`  ${i + 1}. ${p.prenom} ${p.nom} — GIR ${p.gir_niveau}${apa} — enregistré le ${date}`);
      if (p.gir_description) lines.push(`     Profil : ${p.gir_description}`);
      if (p.telephone) lines.push(`     Tél : ${p.telephone}`);
      if (p.email) lines.push(`     Email : ${p.email}`);
      if (p.notes) lines.push(`     Notes : ${p.notes}`);
      if (nbProduits > 0) {
        const produits = p.produits_recommandes!.map((pr) => `${pr.nom} (${pr.reference})`).join(', ');
        lines.push(`     Équipements recommandés : ${produits}`);
      }
    });
  } else if (context.patients) {
    lines.push('\nClients enregistrés : aucun patient dans la base.');
  }

  lines.push('--- FIN DU CONTEXTE ---');
  return lines.join('\n');
}

async function handleGestion(req: NextRequest): Promise<Response> {
  const { messages, context }: { messages: { role: string; content: string }[]; context?: GestionContext } = await req.json();

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  let systemPrompt = PROMPT_GESTION + SYSTEM_KNOWLEDGE_GESTION;

  // Injecter le contexte live (panier, date, pharmacie) si disponible
  if (context) {
    systemPrompt += buildLiveContext(context);
  }

  if (isProductQuery(lastUserMessage)) {
    const products = await searchCatalogue(lastUserMessage);
    const productCtx = formatProductContext(products);
    if (productCtx) systemPrompt += productCtx;
  }

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_GESTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      max_tokens: 512,
      temperature: 0.5,
    }),
  });

  if (!mistralRes.ok) {
    const errBody = await mistralRes.text();
    console.error(`[chat/gestion] Mistral ${mistralRes.status}:`, errBody);
    return new Response(JSON.stringify({ error: `Erreur Mistral ${mistralRes.status}` }), {
      status: mistralRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = mistralRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ligne SSE invalide, ignorée
          }
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ─── Mode Comptoir Chat (streaming SSE) ──────────────────────────────────────

async function handleComptoirChat(req: NextRequest): Promise<Response> {
  const { messages }: { messages: { role: string; content: string }[] } = await req.json();

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  let systemPrompt = PROMPT_COMPTOIR_CHAT;
  if (isProductQueryComptoir(lastUserMessage)) {
    const products = await searchCatalogue(lastUserMessage);
    const context = formatProductContext(products);
    if (context) systemPrompt += context;
  }

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_GESTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      max_tokens: 300,
      temperature: 0.4,
    }),
  });

  if (!mistralRes.ok) {
    const errBody = await mistralRes.text();
    console.error(`[chat/comptoir-chat] Mistral ${mistralRes.status}:`, errBody);
    return new Response(JSON.stringify({ error: `Erreur Mistral ${mistralRes.status}` }), {
      status: mistralRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = mistralRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ligne SSE invalide, ignorée
          }
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ─── Mode Particulier (streaming SSE, langage courant) ───────────────────────

const PROMPT_PARTICULIER = `Tu es Hellia, une conseillère bienveillante et accessible de LGm@d, spécialisée dans les équipements d'aide à domicile.

Tu parles à un particulier — un patient ou un proche aidant. Ce n'est PAS un professionnel de santé.

# RÈGLES ABSOLUES
- Parle en langage simple et courant. Zéro jargon médical ou administratif.
- Si tu dois utiliser un acronyme, explique-le immédiatement :
  → "l'APA (une aide financière de l'État pour les personnes âgées)"
  → "la MDPH (la Maison du Handicap, qui gère les aides pour les personnes en situation de handicap)"
  → "la Sécurité Sociale (l'assurance maladie publique)"
- Sois chaleureux, rassurant, patient. L'utilisateur peut être anxieux ou fatigué.
- Phrases courtes. Maximum 2-3 phrases par paragraphe.
- À la fin de chaque réponse, propose toujours une action concrète ou une question pour aller plus loin.
- Quand tu recommandes un produit, décris-le en langage courant avec un exemple concret :
  → "un déambulateur, c'est un cadre léger en métal avec 4 pieds — vous l'avancez devant vous à chaque pas et il vous donne un point d'appui solide des deux côtés"
  → "un rollator, c'est comme un déambulateur mais avec des roulettes — vous poussez plutôt que soulever, et la plupart ont un petit siège pour se reposer en chemin"
- Ne pose JAMAIS de diagnostic médical. Si quelqu'un décrit des symptômes graves ou urgents, oriente-les vers leur médecin ou le 15 (SAMU) avec bienveillance.
- Ne parle jamais de marges, de prix d'achat, de références LPPR brutes. Tu peux mentionner qu'un équipement peut être remboursé et expliquer comment se renseigner.
- Réponds uniquement en français.
- Utilise du markdown léger (**gras**, listes à tirets) pour structurer les réponses longues.

# TON CONTEXTE
Tu travailles pour LGm@d, une plateforme d'aide à domicile liée à des pharmacies partenaires. Les équipements que tu recommandes sont disponibles en pharmacie, avec conseils personnalisés.

# FORMAT DE RÉPONSE
Texte libre en markdown. PAS de JSON. Réponses concises mais complètes (100-200 mots max en général).`;

async function handleParticulier(req: NextRequest): Promise<Response> {
  const { messages }: { messages: { role: string; content: string }[] } = await req.json();

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  let systemPrompt = PROMPT_PARTICULIER;

  if (isProductQuery(lastUserMessage)) {
    const products = await searchCatalogue(lastUserMessage);
    const productCtx = formatProductContext(products);
    if (productCtx) systemPrompt += productCtx;
  }

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_GESTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-16).map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.55,
    }),
  });

  if (!mistralRes.ok) {
    const errBody = await mistralRes.text();
    console.error(`[chat/particulier] Mistral ${mistralRes.status}:`, errBody);
    return new Response(JSON.stringify({ error: `Erreur Mistral ${mistralRes.status}` }), {
      status: mistralRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = mistralRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.choices?.[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          } catch { /* ignored */ }
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'comptoir';

    if (mode === 'gestion') return await handleGestion(req);
    if (mode === 'comptoir-chat') return await handleComptoirChat(req);
    if (mode === 'particulier') return await handleParticulier(req);
    return await handleComptoir(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[chat] Erreur:', msg);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
