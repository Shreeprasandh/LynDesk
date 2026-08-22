import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("[Security Violation]: Supabase Admin client cannot be initialized on the client-side.");
}

/**
 * Server-only Supabase Admin Client helper for Next.js App Router API Route Handlers.
 * Standardizes administrative operations using SUPABASE_SERVICE_ROLE_KEY.
 * NEVER expose service role keys to client-side bundles.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  if (!serviceRoleKey) {
    throw new Error("[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is required for admin server operations.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
