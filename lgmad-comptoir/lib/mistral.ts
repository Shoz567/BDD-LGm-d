import { Mistral } from '@mistralai/mistralai';

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Missing required environment variable: MISTRAL_API_KEY');
}

export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const MISTRAL_CHAT_MODEL = process.env.MISTRAL_CHAT_MODEL ?? 'mistral-large-latest';
export const MISTRAL_EMBED_MODEL = process.env.MISTRAL_EMBED_MODEL ?? 'mistral-embed';
export const MISTRAL_VISION_MODEL = process.env.MISTRAL_VISION_MODEL ?? 'pixtral-large-latest';
