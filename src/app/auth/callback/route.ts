import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Handles OAuth callback from Supabase Auth.
 * Exchanges the code for a session and redirects to portal.
 *
 * Also links user_id → member record on first login.
 * When Thomas approves an application, the member row is created with user_id = null.
 * This step sets user_id once the member authenticates for the first time.
 */
export async function GET(request: Request) {
  const { searchParams, origin, host } = new URL(request.url);
  const code = searchParams.get("code");
  const isAppSubdomain = host.startsWith("app.");
  const defaultRedirect = isAppSubdomain ? "/portal" : "/portal";
  const redirect = searchParams.get("redirect") || defaultRedirect;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Link user_id to member record if they were pre-approved by Thomas
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const db = createAdminClient();
        const { data: unlinked } = await db
          .from("members")
          .select("id")
          .eq("email", user.email)
          .is("user_id", null)
          .maybeSingle();

        if (unlinked) {
          await db
            .from("members")
            .update({ user_id: user.id })
            .eq("id", unlinked.id);
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
