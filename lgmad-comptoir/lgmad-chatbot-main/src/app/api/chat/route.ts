// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PROMPT_COMPTOIR, PROMPT_GESTION } from '@/lib/prompts';
import type { Message, ChatMode } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const { messages, mode }: {
      messages: Message[];
      mode: ChatMode;
    } = await req.json();

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error('MISTRAL_API_KEY manquante dans .env.local');
      return NextResponse.json({ error: 'Cle API manquante' }, { status: 500 });
    }

    const systemPrompt = mode === 'gestion' ? PROMPT_GESTION : PROMPT_COMPTOIR;
    const model = mode === 'gestion' ? 'mistral-small-latest' : 'mistral-large-latest';

    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!mistralRes.ok) {
      const errBody = await mistralRes.text();
      console.error(`Mistral API error ${mistralRes.status}:`, errBody);
      return NextResponse.json(
        { error: `Erreur Mistral ${mistralRes.status}` },
        { status: mistralRes.status }
      );
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
              // ligne SSE invalide, on ignore
            }
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (err) {
    console.error('Erreur route chat:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
