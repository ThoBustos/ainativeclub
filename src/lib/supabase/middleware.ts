import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomain routing + auth middleware.
 *
 * - app.ainativeclub.com → Portal (requires auth + membership)
 * - ainativeclub.com → Marketing site (public)
 * - ainativeclub.com/portal → Redirects to app.ainativeclub.com
 */

const APP_SUBDOMAIN = "app";
const PRODUCTION_DOMAIN = "ainativeclub.com";

function getSubdomain(host: string): string | null {
  // Local development
  if (host.includes("localhost")) {
    // app.localhost:4015 → "app"
    const parts = host.split(".");
    if (parts.length > 1 && parts[0] !== "www") {
      return parts[0];
    }
    return null;
  }

  // Production: app.ainativeclub.com → "app"
  const parts = host.replace(`:${process.env.PORT || ""}`, "").split(".");
  if (parts.length > 2 && parts[0] !== "www") {
    return parts[0];
  }
  return null;
}

function isAppSubdomain(host: string): boolean {
  return getSubdomain(host) === APP_SUBDOMAIN;
}

function getAppUrl(request: NextRequest, path: string = "/"): string {
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  // Local development
  if (request.headers.get("host")?.includes("localhost")) {
    return `${protocol}://app.localhost:4015${path}`;
  }

  return `${protocol}://${APP_SUBDOMAIN}.${PRODUCTION_DOMAIN}${path}`;
}

function getMainUrl(request: NextRequest, path: string = "/"): string {
  const protocol = request.headers.get("x-forwarded-proto") || "https";

  // Local development
  if (request.headers.get("host")?.includes("localhost")) {
    return `${protocol}://localhost:4015${path}`;
  }

  return `${protocol}://www.${PRODUCTION_DOMAIN}${path}`;
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const host = request.headers.get("host") || "";
  const isApp = isAppSubdomain(host);
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Service role client for member checks (bypasses RLS)
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ===================
  // MAIN DOMAIN ROUTING
  // ===================
  if (!isApp) {
    // Redirect /portal/* to app subdomain
    if (pathname.startsWith("/portal")) {
      const appPath = pathname.replace("/portal", "") || "/";
      return NextResponse.redirect(getAppUrl(request, appPath));
    }

    // Main domain login redirects to app subdomain login
    if (pathname === "/login") {
      return NextResponse.redirect(getAppUrl(request, "/login"));
    }

    // Everything else on main domain is public (marketing site)
    return supabaseResponse;
  }

  // ==================
  // APP SUBDOMAIN ROUTING
  // ==================

  // Public routes on app subdomain (no auth required)
  const publicRoutes = ["/login", "/auth/callback", "/auth/signout"];
  const publicFiles = ["/manifest.json", "/favicon.svg", "/favicon.ico", "/robots.txt"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPublicFile = publicFiles.includes(pathname);

  if (isPublicFile) {
    return supabaseResponse;
  }

  if (isPublicRoute) {
    // If logged in member visits /login, redirect to portal home
    if (pathname === "/login" && user) {
      const { data: member } = await adminClient
        .from("members")
        .select("id, status")
        .eq("user_id", user.id)
        .single();

      if (member && member.status === "active") {
        return NextResponse.redirect(getAppUrl(request, "/"));
      }
    }
    return supabaseResponse;
  }

  // All other routes on app subdomain require auth + membership

  // Not logged in → login page
  if (!user) {
    const loginUrl = new URL(getAppUrl(request, "/login"));
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl.toString());
  }

  // Check membership
  const { data: member } = await adminClient
    .from("members")
    .select("id, role, status")
    .eq("user_id", user.id)
    .single();

  // Not a member or not active → not-a-member page
  if (!member || member.status !== "active") {
    return NextResponse.redirect(getAppUrl(request, "/not-a-member"));
  }

  // Store member info in headers for downstream use
  supabaseResponse.headers.set("x-member-id", member.id);
  supabaseResponse.headers.set("x-member-role", member.role);

  return supabaseResponse;
}
