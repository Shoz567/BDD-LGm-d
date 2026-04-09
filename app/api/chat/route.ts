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
  const { messages, profil, lastStep }: { messages: { role: string; content: string }[]; profil: Partial<PatientProfile>; lastStep?: string } =
    await req.json();

  const gir = Object.keys(profil).length >= 4 ? calculerGIR(profil) : undefined;
  const systemPrompt = buildSystemPrompt(profil, gir, lastStep);

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
    age: 'Dans quelle tranche d\'âge vous situez-vous ?',
    sexe: 'Êtes-vous un homme ou une femme ?',
    coherence: 'La lucidité et l\'orientation sont-elles toujours présentes ?',
    mobilite: 'Comment se passent les déplacements à l\'intérieur ?',
    deplacementExterieur: 'Et pour les sorties extérieures ?',
    transferts: 'Pour bien vous orienter sur les équipements, pouvez-vous me dire si se lever et s\'asseoir se fait seul(e) ?',
    toilette: 'Et pour la toilette, y a-t-il besoin d\'aide ?',
    habillage: 'Et pour s\'habiller ?',
    alimentation: 'Et pour les repas ?',
    elimination: 'Concernant la continence, y a-t-il des difficultés ?',
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

async function handleGestion(req: NextRequest): Promise<Response> {
  const { messages }: { messages: { role: string; content: string }[] } = await req.json();

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  let systemPrompt = PROMPT_GESTION + SYSTEM_KNOWLEDGE_GESTION;
  if (isProductQuery(lastUserMessage)) {
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

// ─── Router ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Peek at the URL to determine mode (comptoir vs gestion vs comptoir-chat)
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'comptoir';

    if (mode === 'gestion') {
      return await handleGestion(req);
    }
    if (mode === 'comptoir-chat') {
      return await handleComptoirChat(req);
    }
    return await handleComptoir(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[chat] Erreur:', msg);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
