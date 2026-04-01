/**
 * Generate Mistral embeddings for all products that don't have one yet.
 * Run: npx tsx scripts/generate_embeddings.ts
 *
 * Uses batches of 10 products × embedding API to stay within rate limits.
 * Resumable: skips products that already have an embedding.
 */
import { createClient } from '@supabase/supabase-js';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MISTRAL_API_KEY',
] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

const EMBED_MODEL = 'mistral-embed';
const BATCH_SIZE = 10; // Mistral embed API limit per request
const DELAY_MS = 500; // Delay between batches to respect rate limits

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Fetch all products without an embedding
  console.log('Fetching products without embeddings...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, reference, nom, description, categorie')
    .is('embedding', null)
    .order('id');

  if (error) {
    console.error('Error fetching products:', error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('✅ All products already have embeddings.');
    return;
  }

  console.log(`Found ${products.length} products without embeddings. Starting generation...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    // Build text for each product: nom + categorie + description snippet
    const texts = batch.map((p) => {
      const desc = p.description ? ` — ${p.description.slice(0, 200)}` : '';
      return `${p.nom} [${p.categorie ?? 'général'}]${desc}`;
    });

    try {
      const embedResponse = await mistral.embeddings.create({
        model: EMBED_MODEL,
        inputs: texts,
      });

      // Update each product with its embedding
      for (let j = 0; j < batch.length; j++) {
        const embedding = embedResponse.data[j]?.embedding;
        if (!embedding) {
          console.warn(`No embedding returned for product ${batch[j].reference}`);
          errorCount++;
          continue;
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({ embedding })
          .eq('id', batch[j].id);

        if (updateError) {
          console.error(`Failed to update ${batch[j].reference}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }
      }

      const processed = Math.min(i + BATCH_SIZE, products.length);
      console.log(`✔️  ${processed} / ${products.length} processed (${successCount} ok, ${errorCount} errors)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, msg);
      errorCount += batch.length;
    }

    if (i + BATCH_SIZE < products.length) {
      await delay(DELAY_MS);
    }
  }

  console.log(`\n✅ Done. ${successCount} embeddings generated, ${errorCount} errors.`);
  if (errorCount > 0) {
    console.log('Re-run the script to retry failed products (they still have null embeddings).');
  }
}

main().catch(console.error);
