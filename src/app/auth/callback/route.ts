import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles OAuth callback from Supabase Auth.
 * Exchanges the code for a session and redirects to portal.
 */
export async function GET(request: Request) {
  const { searchParams, origin, host } = new URL(request.url);
  const code = searchParams.get("code");
  // On app subdomain, default redirect is "/" (which serves portal)
  const isAppSubdomain = host.startsWith("app.");
  const defaultRedirect = isAppSubdomain ? "/" : "/portal";
  const redirect = searchParams.get("redirect") || defaultRedirect;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
