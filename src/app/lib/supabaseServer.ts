import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase Admin Client helper for Next.js App Router API Route Handlers.
 * Standardizes administrative operations using SUPABASE_SERVICE_ROLE_KEY.
 * NEVER expose service role keys to client-side bundles.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
