import { createBrowserClient } from '@supabase/ssr';

// Debug: Check Supabase env vars on client
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('⚠️ Supabase client: Missing URL or ANON_KEY');
  }

  return createBrowserClient(url!, key!);
}
