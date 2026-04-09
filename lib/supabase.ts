import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Variables d\'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Les variables sont garanties non-undefined après le guard ci-dessus
const _url = SUPABASE_URL as string;
const _anonKey = SUPABASE_ANON_KEY as string;

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(_url, _anonKey);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!SUPABASE_SERVICE_KEY) {
      console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY absent — utilisation de la clé anon (permissions limitées)');
    }
    _supabaseAdmin = createClient(_url, SUPABASE_SERVICE_KEY ?? _anonKey);
  }
  return _supabaseAdmin;
}
