"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { clientEnv } from "../env";

/**
 * Creates a Supabase client for browser/client-side operations.
 * Use this for auth operations in client components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
