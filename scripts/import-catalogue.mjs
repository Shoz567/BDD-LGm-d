/**
 * Script de migration : import du nouveau catalogue CSV vers Supabase
 * Usage : node scripts/import-catalogue.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUPABASE_URL = 'https://bemyvieaqvrrfghwxwah.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbXl2aWVhcXZycmZnaHd4d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwMjc3MiwiZXhwIjoyMDg5ODc4NzcyfQ.Tdu61eDzONB_cVylh_kGQe8ET2H1h8FZMQHiGsKwujo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping catégories CSV → snake_case (utilisé dans l'app)
const CATEGORIE_MAP = {
  'aides techniques': 'aides_techniques',
  'aide technique': 'aides_techniques',
  'aide à la marche': 'aide_marche',
  'la chambre': 'chambre',
  'chambre': 'chambre',
  'salle de bain': 'salle_de_bain',
  'fauteuils roulants': 'fauteuils',
  'fauteuils': 'fauteuils',
  'toilettes': 'toilettes',
  'protections': 'protections',
  'soins': 'soins',
};

function mapCategorie(raw) {
  const key = (raw ?? '').trim().toLowerCase();
  return CATEGORIE_MAP[key] ?? 'aides_techniques';
}

/**
 * Parseur pipe-délimité avec support des champs entre guillemets doubles.
 * Les guillemets dans les valeurs sont échappés en doublant : "" → "
 */
function parsePipeDelimitedLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Guillemet suivant = guillemet échappé
        if (line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          // Fin du champ guillemété
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === '|') {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(filePath) {
  const content = readFileSync(filePath, 'utf-8')
    .replace(/^\uFEFF/, '') // Supprimer le BOM UTF-8
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const lines = content.split('\n').filter(l => l.trim());
  const headers = parsePipeDelimitedLine(lines[0]);

  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parsePipeDelimitedLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    if (row.reference) products.push(row);
  }
  return products;
}

function checkImageExists(reference) {
  const imagePath = join(ROOT, 'public', 'products', `${reference}.jpg`);
  return existsSync(imagePath);
}

function buildProduct(row) {
  const reference = row.reference?.trim();
  const hasImage = checkImageExists(reference);

  // Le champ documents peut contenir plusieurs URLs séparées par | — on prend la première
  const rawDocuments = row.documents?.trim() || '';
  const firstPdf = rawDocuments.split('|')[0].trim();
  const pdfUrl = firstPdf.startsWith('http') ? firstPdf : null;

  return {
    reference,
    nom: row.nom?.trim() || '',
    description: row.description?.trim() || '',
    categorie: mapCategorie(row.categorie),
    prix_ttc: parseFloat(row.prix_ttc) || 0,
    base_lppr: parseFloat(row.base_lppr) || 0,
    code_lppr: row.code_lppr?.trim() || null,
    image_url: hasImage ? `/products/${reference}.jpg` : null,
    pdf_url: pdfUrl,
    points_forts: row.points_forts?.trim() || null,
    expert: row.expert?.trim() || null,
    specs: row.specs?.trim() || null,
    recommande: row.recommande?.trim() || null,
  };
}

async function main() {
  const csvPath = join(ROOT, 'wetransfer_products-zip_2026-04-03_0653', 'catalogue_categorise_ia.csv');
  console.log('📂 Lecture du CSV...');
  const rows = parseCsv(csvPath);
  console.log(`✅ ${rows.length} produits trouvés dans le CSV`);

  const products = rows.map(buildProduct);

  const withImages = products.filter(p => p.image_url !== null).length;
  const withoutImages = products.length - withImages;
  console.log(`🖼️  ${withImages} produits avec image, ${withoutImages} sans image`);

  // Afficher la répartition des catégories
  const catCount = {};
  products.forEach(p => { catCount[p.categorie] = (catCount[p.categorie] || 0) + 1; });
  console.log('📊 Répartition des catégories :');
  Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  // Étape 1 : vider la table
  console.log('\n🗑️  Suppression des anciens produits...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('reference', '__IMPOSSIBLE__'); // Supprimer tous les enregistrements

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression :', deleteError.message);
    process.exit(1);
  }
  console.log('✅ Table vidée');

  // Étape 2 : insérer par lots de 200
  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error(`❌ Erreur lors de l'insertion (batch ${Math.floor(i / BATCH_SIZE) + 1}) :`, error.message);
      // Afficher le premier produit problématique
      console.error('Premier produit du batch :', JSON.stringify(batch[0], null, 2));
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r⬆️  Insertion : ${inserted}/${products.length}`);
  }

  console.log(`\n✅ ${inserted} produits importés avec succès !`);
}

main().catch(err => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});
