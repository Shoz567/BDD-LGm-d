import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface Product {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  image_url: string | null;
  description: string | null;
}

function relevanceScore(p: Product, q: string): number {
  const ql = q.toLowerCase();
  const nom = p.nom.toLowerCase();
  const ref = p.reference.toLowerCase();
  if (ref === ql) return 100;
  if (ref.startsWith(ql)) return 90;
  if (nom === ql) return 80;
  if (nom.startsWith(ql)) return 70;
  if (ref.includes(ql)) return 60;
  if (nom.includes(ql)) return 50;
  return 10;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  const { data } = await getSupabaseAdmin()
    .from('products')
    .select('id, reference, nom, categorie, image_url, description')
    .or(`nom.ilike.*${q}*,reference.ilike.*${q}*,description.ilike.*${q}*`)
    .limit(20);

  const sorted = (data ?? [])
    .sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q))
    .slice(0, 7)
    .map(({ description: _, ...rest }) => rest);

  return NextResponse.json(sorted);
}
