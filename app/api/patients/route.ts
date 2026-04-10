import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { prenom, nom, telephone, email, notes, gir, profil, produits } = await req.json();

  if (!prenom?.trim() || !nom?.trim() || !gir) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('patients')
    .insert({
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone?.trim() || null,
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      gir_niveau: gir.niveau,
      gir_score: gir.scoreTotal,
      gir_description: gir.description,
      gir_eligible_apa: gir.eligibleAPA,
      profil: profil || null,
      produits_recommandes: produits?.map((p: {
        reference: string;
        nom: string;
        prix_ttc: number;
        categorie_mad?: string;
        categorie?: string;
      }) => ({
        reference: p.reference,
        nom: p.nom,
        prix_ttc: p.prix_ttc,
        categorie: p.categorie_mad ?? p.categorie,
      })) || null,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('[patients] Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
