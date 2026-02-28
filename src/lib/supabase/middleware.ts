import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the Supabase auth session and returns response with refreshed cookies.
 * Called from middleware.ts to keep sessions alive.
 * Also checks member status for portal access.
 */
export async function updateSession(request: NextRequest) {
  // Note: We can't use clientEnv/serverEnv here because middleware runs in Edge runtime
  // and env validation happens at build time. Direct process.env access is required.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Auth client (with cookies for session)
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Service role client for member checks (bypasses RLS)
  const adminClient = createClient(
    supabaseUrl,
    supabaseServiceKey
  );

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - check auth AND member status
  if (request.nextUrl.pathname.startsWith("/portal")) {
    // Not logged in → login page
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Logged in → check if they're an active member (using service role to bypass RLS)
    const { data: member } = await adminClient
      .from("members")
      .select("id, role, status")
      .eq("user_id", user.id)
      .single();

    // Not a member or not active → not-a-member page
    if (!member || member.status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/not-a-member";
      return NextResponse.redirect(url);
    }

    // Store member info in headers for downstream use
    supabaseResponse.headers.set("x-member-id", member.id);
    supabaseResponse.headers.set("x-member-role", member.role);
  }

  // Redirect authenticated users away from login page (but only if they're members)
  if (request.nextUrl.pathname === "/login" && user) {
    const { data: member } = await adminClient
      .from("members")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (member && member.status === "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
