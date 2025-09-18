// src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Export a single supabase client and the default bucket name.
 *
 * Environment variables (Expo recommended prefix: EXPO_PUBLIC_*)
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 * - EXPO_PUBLIC_SUPABASE_BUCKET  (optional; defaults to "ai-assis")
 *
 * IMPORTANT: Use only the ANON key here (client). Do NOT put service_role key in the app.
 */

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "<YOUR_SUPABASE_URL>";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "<YOUR_ANON_KEY>";
export const SUPABASE_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_BUCKET || process.env.SUPABASE_BUCKET || "ai-assis";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // It's fine to warn during dev; do not throw in production apps that rely on remote env injection.
  // But this helps you notice missing keys early.
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase config: missing URL or ANON KEY. Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
