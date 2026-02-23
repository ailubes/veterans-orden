import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Module-level singleton — prevents multiple GoTrueClient instances
// createBrowserClient is safe to call multiple times with same args (it deduplicates internally),
// but we also hold a reference to avoid creating duplicate Realtime connections.
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // SSR: always create fresh (server has no shared state)
    return createBrowserClient(url, key);
  }
  if (!_client) {
    _client = createBrowserClient(url, key);
  }
  return _client;
}
