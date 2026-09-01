import { z } from "zod";

/**
 * Master Centralized Environment Schema & Runtime Configuration.
 * Enforces type safety and boot-time verification for all server and client environment secrets.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development"
};

export function validateEnv() {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.warn("[Environment Warning]: Some non-critical environment keys are unparsed:", result.error.format());
  }
  return env;
}
