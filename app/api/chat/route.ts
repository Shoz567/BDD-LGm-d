import { NextRequest, NextResponse } from 'next/server';
import { mistral, MISTRAL_CHAT_MODEL, MISTRAL_GESTION_MODEL } from '@/lib/mistral';
import { buildSystemPrompt } from '@/lib/prompts';
import { PROMPT_GESTION, SYSTEM_KNOWLEDGE_GESTION } from '@/lib/prompts';
import { calculerGIR } from '@/lib/scoring';
import { PatientProfile } from '@/lib/types';
import { extractJson } from '@/lib/parseJson';
import { fixQuickActionLabels } from '@/lib/quickActionLabels';

// ─── Mode Comptoir ────────────────────────────────────────────────────────────

async function handleComptoir(req: NextRequest): Promise<NextResponse> {
  const { messages, profil }: { messages: { role: string; content: string }[]; profil: Partial<PatientProfile> } =
    await req.json();

  const gir = Object.keys(profil).length >= 4 ? calculerGIR(profil) : undefined;
  const systemPrompt = buildSystemPrompt(profil, gir);

  const response = await mistral.chat.complete({
    model: MISTRAL_CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-12).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.3,
    maxTokens: 400,
  });

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

async function handleGestion(req: NextRequest): Promise<Response> {
  const { messages }: { messages: { role: string; content: string }[] } = await req.json();

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_GESTION_MODEL,
      messages: [
        { role: 'system', content: PROMPT_GESTION + SYSTEM_KNOWLEDGE_GESTION },
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

// ─── Router ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Peek at the URL to determine mode (comptoir vs gestion)
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'comptoir';

    if (mode === 'gestion') {
      return await handleGestion(req);
    }
    return await handleComptoir(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[chat] Erreur:', msg);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
