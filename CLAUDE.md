# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **LGm@d — Mode Comptoir**, a conversational AI assistant for medical equipment sales at pharmacy counters. It guides pharmacists through a structured AGGIR assessment interview to determine patient GIR (dependency) level and recommend appropriate home medical equipment (MAD).

The main app lives in `lgmad-comptoir/`. The root also contains reference materials: `catalogue_aprium_mad_nsi_clean.csv` (2,470 products), `Questionnaire.md`, `implementation_plan.md`, and `Document.pdf`.

## Commands

All commands run from `lgmad-comptoir/`:

```bash
cd lgmad-comptoir
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint check
npx tsx scripts/import_catalog.ts  # Import CSV catalog to Supabase
```

## Next.js Version Warning

This project uses Next.js 16.2.1 — a version with breaking changes from your training data. Before writing any Next.js code, check `node_modules/next/dist/docs/` for current API conventions.

## Architecture

### Request Flow

```
/comptoir page  →  /api/chat      →  Mistral Large (mistral-large-latest)
                →  /api/ocr       →  Mistral Vision (pixtral-large-latest)
                →  /api/recommend →  Mistral Embed → Supabase pgvector → Mistral Large
```

### Core Libraries (`lgmad-comptoir/lib/`)

- **`types.ts`**: All TypeScript interfaces — `PatientProfile`, `GIRScore`, `Product`, `ChatMessage`, `DemoPersona`. Read this first when working on any feature.
- **`scoring.ts`**: GIR calculation with AGGIR weighted variables. Also exports `getCategoriesByGIR()` (product categories per GIR) and `describeGIRForAI()` (text for LLM context).
- **`prompts.ts`**: System prompts for the 15-step interview, OCR extraction schema, and product ranking instructions. Exports `LABELS_PRIORITES` (MAD category icons/labels).
- **`personas.ts`**: 6 pre-configured demo cases covering GIR 6→1 (Marie→André).
- **`mistral.ts`**: Mistral client + model constants (`MISTRAL_CHAT_MODEL`, `MISTRAL_EMBED_MODEL`, `MISTRAL_VISION_MODEL`).
- **`supabase.ts`**: Supabase clients (public anon + admin service role).

### API Routes (`lgmad-comptoir/app/api/`)

- **`chat/route.ts`**: POST. Receives `{ messages[], profil }`. Returns `{ message, step, profilUpdate, quickActions, isComplete, gir }`. Keeps last 12 messages for context. Uses `calculerGIR()` after enough profile fields are filled.
- **`recommend/route.ts`**: POST. Two-stage: (1) Mistral Embed creates 1024-dim vector from profile query, Supabase RPC `search_products()` returns 20 candidates; (2) Mistral Large ranks top 3-5 and writes markdown medical summary. Falls back to keyword search if vector search fails.
- **`ocr/route.ts`**: POST. Accepts image/PDF, converts to base64, calls pixtral vision model. Returns `{ medicaments[], pathologies[], dispositifsMedicaux[], prescripteur, date }`.

### Database

Supabase PostgreSQL with pgvector. The `products` table has a 1024-dim `embedding` column. The `search_products()` RPC function does cosine similarity search, optionally filtered by `filter_categories[]`.

Migration: `supabase/migrations/20260323222619_init.sql`

### GIR Scoring Algorithm

10 AGGIR discriminant variables with weights:
- Cohérence ×2, Orientation ×2, Toilette ×1.5, Élimination ×1.5, Transferts ×1.5
- Habillage ×1, Alimentation ×1, Mobilité intérieure ×1
- Déplacements extérieurs ×0.5, Communication ×0.5
- Situation aggravante ×1, Bonus 80+ (+1)

Score max ≈ 28. Thresholds: GIR 1 (most dependent) → GIR 6 (autonomous). APA eligibility: GIR ≤ 4.

### Key UI Patterns

The main `app/comptoir/page.tsx` is a large React component managing:
- Chat message history + streaming responses
- Real-time `PatientProfile` accumulation via `profilUpdate` from each API response
- GIR recomputation after each profile update
- TTS (Web Speech API) and STT (SpeechRecognition API) for accessibility
- GDPR consent gate before starting the interview
- Demo persona loader (triggers profile + recommendations)

## Environment Variables

Required in `lgmad-comptoir/.env.local`:
- `MISTRAL_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
