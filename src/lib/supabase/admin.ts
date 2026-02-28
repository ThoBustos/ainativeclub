import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import { clientEnv, serverEnv } from "../env";

/**
 * Creates a Supabase client with service role key for server-side operations.
 * Only use in Server Actions or API routes - never expose to client.
 */
export function createAdminClient() {
  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Backwards compatibility alias
export const createServerClient = createAdminClient;
