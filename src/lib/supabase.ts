import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Kredensial Supabase belum diatur di .env.local');
}

let formattedUrl = supabaseUrl;
if (formattedUrl && !formattedUrl.startsWith('http')) {
  formattedUrl = `https://${formattedUrl}.supabase.co`;
}

export const supabase = createClient(
  formattedUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
);
