import { NextRequest, NextResponse } from 'next/server';
import { mistral } from '@/lib/mistral';

// Use small model for guided conversation (faster + cheaper)
// Large model reserved for recommendations where quality matters
const CHAT_MODEL = process.env.MISTRAL_CHAT_MODEL ?? 'ministral-8b-latest';
import { buildSystemPrompt } from '@/lib/prompts';
import { calculerGIR } from '@/lib/scoring';
import { PatientProfile } from '@/lib/types';
import { extractJson } from '@/lib/parseJson';
import { fixQuickActionLabels } from '@/lib/quickActionLabels';


export async function POST(req: NextRequest) {
  try {
    const { messages, profil }: { messages: { role: string; content: string }[]; profil: Partial<PatientProfile> } =
      await req.json();

    const gir = Object.keys(profil).length >= 4 ? calculerGIR(profil) : undefined;
    const systemPrompt = buildSystemPrompt(profil, gir);

    const response = await mistral.chat.complete({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-12).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
      maxTokens: 1000,
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
      console.error('[chat] JSON parse failed, raw content:', rawContent);
      return NextResponse.json(
        { message: 'Désolé, une erreur de traitement est survenue. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Numeric AGGIR fields may come as strings from the model — coerce them
    const NUMERIC_FIELDS = ['coherence','orientation','toilette','habillage','alimentation','elimination','transferts','mobilite','deplacementExterieur','communication','situationRecente'];
    const profilUpdate = parsed.profilUpdate ?? {};
    for (const field of NUMERIC_FIELDS) {
      if (field in profilUpdate && typeof (profilUpdate as Record<string,unknown>)[field] === 'string') {
        (profilUpdate as Record<string,unknown>)[field] = Number((profilUpdate as Record<string,unknown>)[field]);
      }
    }

    const updatedProfil = { ...profil, ...profilUpdate };
    const updatedGIR = Object.keys(updatedProfil).length >= 4 ? calculerGIR(updatedProfil) : undefined;

    return NextResponse.json({
      message: parsed.message ?? '',
      step: parsed.step,
      profilUpdate: profilUpdate,
      quickActions: parsed.isComplete ? [] : fixQuickActionLabels(parsed.step, parsed.quickActions ?? []),
      isComplete: parsed.isComplete ?? false,
      gir: updatedGIR,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[chat] Error:', msg);
    return NextResponse.json(
      { message: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
