import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ProductDetail } from '@/components/catalogue/ProductDetail';

export default async function ProductPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const { data } = await getSupabaseAdmin()
    .from('products')
    .select('*')
    .eq('reference', decodeURIComponent(reference))
    .single();

  if (!data) notFound();

  return <ProductDetail product={data} backHref="/gestion/catalogue" />;
}
