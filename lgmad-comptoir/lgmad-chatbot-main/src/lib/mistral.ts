// src/lib/mistral.ts
import { Mistral } from '@mistralai/mistralai';

// La cle vient du .env.local - jamais ecrite en dur ici !
export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});
