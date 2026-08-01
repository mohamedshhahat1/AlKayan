import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared browser Supabase client.
 *
 * Each section used to call `createClient(url!, key!)` at module scope. The
 * non-null assertions meant a missing env var produced an unhandled throw
 * during module evaluation — taking down the entire page rather than the one
 * section that needs data — and every section got its own client instance.
 *
 * This module creates at most one client, lazily, and returns `null` when the
 * project has not been configured yet so callers can degrade gracefully.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both public Supabase env vars are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let cachedClient: SupabaseClient | null = null;
let warned = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warned && process.env.NODE_ENV !== "production") {
      warned = true;
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
          "Data-driven sections will render their empty state. See .env.example."
      );
    }
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  return cachedClient;
}
