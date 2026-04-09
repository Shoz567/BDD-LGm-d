import { Mistral } from '@mistralai/mistralai';

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Variable d\'environnement manquante : MISTRAL_API_KEY');
}

export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// Modèles utilisés selon le contexte
export const MISTRAL_CHAT_MODEL = process.env.MISTRAL_CHAT_MODEL ?? 'ministral-8b-latest';
export const MISTRAL_RECOMMEND_MODEL = process.env.MISTRAL_RECOMMEND_MODEL ?? 'mistral-small-latest';
export const MISTRAL_EMBED_MODEL = process.env.MISTRAL_EMBED_MODEL ?? 'mistral-embed';
export const MISTRAL_VISION_MODEL = process.env.MISTRAL_VISION_MODEL ?? 'pixtral-large-latest';
export const MISTRAL_GESTION_MODEL = process.env.MISTRAL_GESTION_MODEL ?? 'mistral-small-latest';
