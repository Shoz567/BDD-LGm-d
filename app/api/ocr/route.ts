import { NextRequest, NextResponse } from 'next/server';
import { mistral, MISTRAL_VISION_MODEL } from '@/lib/mistral';
import { buildOCRPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 413 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (JPEG, PNG, WebP, PDF uniquement)' }, { status: 415 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const response = await mistral.chat.complete({
      model: MISTRAL_VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildOCRPrompt(),
            },
            {
              type: 'image_url',
              imageUrl: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      responseFormat: { type: 'json_object' },
      temperature: 0.1,
      maxTokens: 1000,
    });

    const content = response.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown>;

    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : {};
    } catch {
      return NextResponse.json({ error: 'Impossible d\'analyser la réponse OCR' }, { status: 422 });
    }

    // Validate that at least one expected field is present
    const hasContent = parsed.medicaments || parsed.pathologies || parsed.dispositifsMedicaux;
    if (!hasContent) {
      return NextResponse.json({ error: 'Ordonnance illisible ou non reconnue' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('[ocr] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'ordonnance' },
      { status: 500 }
    );
  }
}

