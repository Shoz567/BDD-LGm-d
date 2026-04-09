# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
```

No test suite configured. Import catalogue data: `node scripts/import-catalogue.mjs`

## Environment Variables

Required in `.env.local`:
```
MISTRAL_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # optional, falls back to anon key
```

Optional model overrides (defaults in `lib/mistral.ts`):
```
MISTRAL_CHAT_MODEL=ministral-8b-latest
MISTRAL_RECOMMEND_MODEL=mistral-small-latest
MISTRAL_EMBED_MODEL=mistral-embed
MISTRAL_VISION_MODEL=pixtral-large-latest
MISTRAL_GESTION_MODEL=mistral-small-latest
```

## Architecture

**LGm@d** is a Next.js 16 app (App Router) for pharmacies. It helps evaluate patient autonomy using the French AGGIR grid and recommends home medical equipment (MAD — Maintien À Domicile).

### Two user-facing modes

- **Comptoir** (`/app/comptoir`) — Customer-facing chat. "Hellia" guides patients/caregivers through a 15-step structured interview, computes a GIR score (1–6), then recommends products.
- **Gestion** (`/app/gestion`) — Pharmacist back-office: catalogue management, clients, orders, and a free-form AI assistant.

### API routes (`/app/api/`)

All AI calls go through these routes; there is no direct model call from the frontend.

| Route | Purpose |
|---|---|
| `POST /api/chat?mode=comptoir` | Structured 15-step AGGIR interview — returns JSON with `message`, `profilUpdate`, `quickActions`, `gir` |
| `POST /api/chat?mode=gestion` | Free-form pharmacist chat — SSE streaming response |
| `POST /api/chat?mode=comptoir-chat` | Free chat after evaluation — SSE streaming |
| `POST /api/recommend` | Semantic product search (pgvector) + AI ranking; falls back to Postgres `tsvector` full-text search |
| `POST /api/ocr` | Vision OCR of prescriptions via Pixtral — returns structured `OrdonnanceData` |
| `GET /api/search?q=` | Keyword product search for autocomplete |
| `POST /api/cart-prices` | Bulk price lookup by product references |

### Core data model (`lib/types.ts`)

- **`PatientProfile`** — 10 AGGIR discriminant variables (each scored 0–2/3) plus contextual fields. Built incrementally during the chat conversation.
- **`GIRScore`** — Weighted score computed by `calculerGIR()` in `lib/scoring.ts`; produces `niveau` 1–6, `eligibleAPA`, and per-variable breakdown.
- **`ConversationStep`** — Enum of the 15 interview steps. The AI returns the current step in each response so the frontend knows where it is.
- **`Product`** — Catalogue item; stored in Supabase `products` table with pgvector embeddings on `nom`+`description`.

### Key lib files

- **`lib/prompts.ts`** — All system prompts. `buildSystemPrompt()` injects current profil + GIR into the comptoir prompt. Prompt rules enforce single-question JSON output.
- **`lib/scoring.ts`** — `calculerGIR()` applies AGGIR weights (cohérence/orientation ×2, toilette/transferts/élimination ×1.5, etc.). `getCategoriesByGIR()` maps GIR level to product categories.
- **`lib/mistral.ts`** — Mistral client singleton + exported model constants. The chat route handles 503 fallbacks automatically.
- **`lib/supabase.ts`** — Lazy singletons `getSupabase()` (anon) and `getSupabaseAdmin()` (service role). Use admin for all server-side operations.
- **`lib/parseJson.ts`** — `extractJson()` strips markdown fences from LLM responses before `JSON.parse`.
- **`lib/personas.ts`** — Demo patient profiles used for testing the chat flow.

### Comptoir chat flow (important invariant)

The `/api/chat?mode=comptoir` endpoint expects the full conversation history + current `profil` object on every request. It returns a `profilUpdate` partial that the frontend merges into its local state. The GIR score is recomputed server-side after each merge and returned in the response. The AI must always return valid JSON; `lib/parseJson.ts` + fallback questions in the route guard against malformed output.

### Supabase schema

The `products` table has a `embedding` column (vector) for pgvector semantic search. The RPC function `search_products(query_embedding, match_count, filter_categories)` performs the similarity search. The recommend route falls back to `textSearch` on `nom` if the vector search fails.
