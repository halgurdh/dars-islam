// Supabase client for auth/profile/school/parent data — NOT the same client
// as src/net/supabaseClient.ts, which is multiplayer-only and deliberately
// disables session persistence for ephemeral game-room connections. This
// one needs a real, persistent login session (magic-link email accounts
// and anonymous student accounts alike).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
    ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

  if (
    !url
    || !key
    || url.includes('YOUR_PROJECT_ID')
    || key.includes('YOUR_ANON_KEY_HERE')
    || key.includes('YOUR_PUBLISHABLE_KEY_HERE')
  ) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the repo-root .env.local.');
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
