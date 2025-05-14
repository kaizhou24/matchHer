// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// For client-side Supabase client (safe with anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL not found. Did you set NEXT_PUBLIC_SUPABASE_URL in .env.local?");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key not found. Did you set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local?");
}

// This is your primary client-side safe Supabase client
// It uses the public anonymous key and respects Row Level Security (RLS)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Store session in localStorage
    autoRefreshToken: true, // Automatically refresh session tokens
    detectSessionInUrl: true, // Useful for OAuth redirects
    // storageKey: 'my-app-auth-token', // Optional: custom storage key
  },
  // You can add global fetch options if needed, like ConnectU's enhancedFetch
  // global: {
  //   fetch: enhancedFetch, // if you implement an enhanced fetch
  // }
});

// --- Server-Side Admin Client (Optional but often needed) ---
// This function should ONLY be called from server-side code (API routes, Server Components)
// as it uses the SERVICE_ROLE_KEY which has admin privileges and bypasses RLS.
//
// IMPORTANT: Ensure process.env.SUPABASE_SERVICE_ROLE_KEY is NOT prefixed with NEXT_PUBLIC_
// so it's never exposed to the client.
//
// You might not need this immediately, but it's a common pattern inspired by ConnectU.
// If you decide to use it, ensure you handle its usage very carefully on the server.

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  // This check helps prevent accidental client-side usage,
  // but true enforcement is ensuring the env var isn't public.
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client should not be initialized on the client-side.');
  }

  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) { // Re-check, though covered above
    throw new Error("Supabase URL not found for admin client.");
  }
  if (!serviceRoleKey) {
    throw new Error("Supabase Service Role Key not found. Did you set SUPABASE_SERVICE_ROLE_KEY in .env.local (and on your server)?");
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdmin;
}

// export async function getCurrentUser() { ... }
// export async function getCurrentUserProfile() { ... }
// These would use the `supabase` (client-side) client.