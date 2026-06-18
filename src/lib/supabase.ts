import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://azjkpnvfnjpqgwmfkuwy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amtwbnZmbmpwcWd3bWZrdXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODMxNjgsImV4cCI6MjA5NjE1OTE2OH0.X-Uy7J15UzGCfp31rAewZ1js757ZIXfJOr2fES1MVjg';

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
