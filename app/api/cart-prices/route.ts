import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { references }: { references: string[] } = await req.json();
  if (!references?.length) return NextResponse.json([]);

  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select('reference, prix_ttc, prix_achat, base_lppr')
    .in('reference', references);

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data ?? []);
}
