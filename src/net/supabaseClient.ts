import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
    ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

  if (
    !url
    || !publishableKey
    || url.includes('YOUR_PROJECT_ID')
    || publishableKey.includes('YOUR_ANON_KEY_HERE')
    || publishableKey.includes('YOUR_PUBLISHABLE_KEY_HERE')
  ) {
    throw new Error('Supabase is not configured for multiplayer. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the repo-root .env.local.');
  }

  client = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
