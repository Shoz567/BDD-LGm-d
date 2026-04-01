import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

const CSV_PATH = path.join(process.cwd(), '../catalogue_aprium_mad_nsi_clean.csv');

// Categorise known products to MAD universes
const keywordCategories: Record<string, string> = {
  'canne': 'aide_marche', 'déambulateur': 'aide_marche', 'rollator': 'aide_marche',
  'lit': 'chambre', 'matelas': 'chambre', 'coussin': 'chambre', 'escarre': 'chambre',
  'fauteuil': 'fauteuils', 'scooter': 'fauteuils',
  'bain': 'salle_de_bain', 'douche': 'salle_de_bain', 'siège': 'salle_de_bain',
  'wc': 'toilettes', 'toilette': 'toilettes', 'rehausseur': 'toilettes', 'chaise percée': 'toilettes',
  'aide': 'aides_techniques', 'enfile': 'aides_techniques', 'pince': 'aides_techniques', 'protection': 'toilettes'
};

function inferCategory(nom: string): string {
  const n = nom.toLowerCase();
  for (const [kw, cat] of Object.entries(keywordCategories)) {
    if (n.includes(kw)) return cat;
  }
  return 'aides_techniques'; // default
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Lecture du CSV...');
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  
  // Parse simple header (pipe separated)
  const parsed = Papa.parse(fileContent, {
    header: true,
    delimiter: '|',
    skipEmptyLines: true,
  });

  console.log(`${parsed.data.length} produits trouvés.`);
  
  // Map and clean products
  const products = parsed.data.map((row: any) => {
    // Nettoyage complet
    const reference = row.reference?.trim() || null;
    const nom = row.nom?.trim() || null;
    
    // Some lines might be malformed if the pipe parser fails on descriptions
    if (!reference || !nom) return null;

    let prix = parseFloat(row.prix_ttc?.replace(',', '.'));
    if (isNaN(prix)) prix = 0;
    
    let baseLppr = parseFloat(row.base_lppr?.replace(',', '.'));
    if (isNaN(baseLppr)) baseLppr = 0;

    const categorie = row.categorie?.trim() || inferCategory(nom);
    const description = row.description?.trim() || '';
    const imageUrl = row.image_url?.trim() || null;

    return {
      reference,
      nom,
      description,
      categorie,
      prix_ttc: prix,
      base_lppr: baseLppr,
      image_url: imageUrl,
    };
  }).filter(Boolean);

  console.log(`${products.length} produits valides à importer.`);
  
  // Clear table first
  console.log('Nettoyage de la base...');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Process in batches
  const BATCH_SIZE = 50; 
  let successCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    
    try {
      // Import directly to Supabase without embeddings (since no Mistral credits yet)
      const { error } = await supabase.from('products').insert(batch);
      
      if (error) {
        console.error(`Erreur insertion lot ${i / BATCH_SIZE}:`, error.message);
      } else {
        successCount += batch.length;
        console.log(`✔️  ${successCount} / ${products.length} importés (sans embeddings)...`);
      }
    } catch (err: any) {
      console.error(`Erreur lors de l'insertion du lot ${i / BATCH_SIZE}:`, err.message);
    }
    
    await delay(100); // Small delay to avoid hammering Supabase
  }

  console.log(`✅ Import terminé. ${successCount} produits intégrés avec succès.`);
}

main().catch(console.error);
