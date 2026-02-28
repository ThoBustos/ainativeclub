import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const APP_SUBDOMAIN = "app";

function isAppSubdomain(host: string): boolean {
  return host.startsWith(`${APP_SUBDOMAIN}.`);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isApp = isAppSubdomain(host);
  const pathname = request.nextUrl.pathname;

  // On app subdomain, rewrite "/" to "/portal" internally
  if (isApp && pathname === "/") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/portal";

    // Create a new request with the rewritten URL for auth processing
    const modifiedRequest = new NextRequest(rewriteUrl, {
      headers: request.headers,
    });

    const response = await updateSession(modifiedRequest);

    // If updateSession returned a redirect, return it
    if (response.headers.get("location")) {
      return response;
    }

    // Otherwise, rewrite to /portal
    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    // Copy cookies from auth response
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    return rewriteResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
