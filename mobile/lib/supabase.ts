/**
 * Supabase client for React Native.
 * Uses AsyncStorage for session persistence on native/web.
 * Falls back to no storage during SSR (Node.js) to avoid "window is not defined".
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// On the server (SSR) there is no window / AsyncStorage — skip persistence.
// At runtime in the app, load AsyncStorage normally.
const storage =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('@react-native-async-storage/async-storage').default ?? undefined)
    : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: storage != null,
    detectSessionInUrl: false,
  },
});
