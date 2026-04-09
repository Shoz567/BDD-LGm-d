/**
 * Génère les embeddings Mistral pour tous les produits du catalogue
 * et les stocke dans la colonne `embedding` de la table `products`.
 *
 * Usage : node scripts/generate-embeddings.mjs
 *
 * - Modèle : mistral-embed (dimension 1024)
 * - Lot    : 10 produits par appel API
 * - Pause  : 500 ms entre chaque lot (rate limit Mistral)
 * - Reprise: saute les produits qui ont déjà un embedding
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bemyvieaqvrrfghwxwah.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbXl2aWVhcXZycmZnaHd4d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwMjc3MiwiZXhwIjoyMDg5ODc4NzcyfQ.Tdu61eDzONB_cVylh_kGQe8ET2H1h8FZMQHiGsKwujo';
const MISTRAL_API_KEY = 'GqgMWEVFopr9idtNtTb5eoR9nLTJEvBQ';

const EMBED_MODEL = 'mistral-embed';
const BATCH_SIZE = 10;
const DELAY_MS = 500;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Construit le texte à vectoriser pour un produit.
 * On combine nom + catégorie + description pour une recherche sémantique pertinente.
 */
function buildEmbedText(product) {
  const parts = [product.nom];
  if (product.categorie) parts.push(product.categorie.replace(/_/g, ' '));
  if (product.description) parts.push(product.description.slice(0, 300));
  if (product.points_forts) parts.push(product.points_forts.slice(0, 150));
  return parts.filter(Boolean).join(' — ');
}

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API ${response.status}: ${error}`);
  }

  const json = await response.json();
  return json.data.map((d) => d.embedding);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 Récupération des produits sans embedding...');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, reference, nom, categorie, description, points_forts')
    .is('embedding', null)
    .order('reference');

  if (error) {
    console.error('❌ Erreur Supabase :', error.message);
    process.exit(1);
  }

  const total = products.length;
  if (total === 0) {
    console.log('✅ Tous les produits ont déjà un embedding.');
    return;
  }

  console.log(`📦 ${total} produits à traiter (par lots de ${BATCH_SIZE})`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const texts = batch.map(buildEmbedText);

    try {
      const embeddings = await generateEmbeddings(texts);

      // Mise à jour en parallèle dans Supabase
      await Promise.all(
        batch.map((product, idx) =>
          supabase
            .from('products')
            .update({ embedding: embeddings[idx] })
            .eq('id', product.id)
        )
      );

      processed += batch.length;
      const percent = Math.round((processed / total) * 100);
      process.stdout.write(`\r⚡ Progression : ${processed}/${total} (${percent}%)`);
    } catch (err) {
      errors += batch.length;
      console.error(`\n❌ Erreur sur le lot ${Math.floor(i / BATCH_SIZE) + 1} :`, err.message);
      // On continue malgré l'erreur pour ne pas bloquer tout le traitement
    }

    if (i + BATCH_SIZE < products.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n\n✅ Terminé : ${processed} embeddings générés, ${errors} erreurs`);

  if (errors > 0) {
    console.log('💡 Relancez le script pour reprendre les produits échoués (les autres sont déjà faits).');
  }
}

main().catch((err) => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});
