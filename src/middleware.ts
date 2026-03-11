import { NextRequest, NextResponse } from "next/server";
import { updateSession, isAppSubdomain } from "@/lib/supabase/middleware";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isApp = isAppSubdomain(host);
  const pathname = request.nextUrl.pathname;

  // Generate a per-request nonce for CSP (eliminates 'unsafe-inline' for scripts)
  const nonce = btoa(String.fromCharCode(...Array.from(crypto.getRandomValues(new Uint8Array(16)))));

  let response: NextResponse;

  // On app subdomain, rewrite "/" to "/portal" internally
  if (isApp && pathname === "/") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/portal";

    const modifiedRequest = new NextRequest(rewriteUrl, {
      headers: request.headers,
    });

    const authResponse = await updateSession(modifiedRequest);

    if (authResponse.headers.get("location")) {
      response = authResponse;
    } else {
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      authResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value);
      });
      // Copy x-member-* headers so portal/page.tsx can read them via headers()
      authResponse.headers.forEach((value, key) => {
        if (key.startsWith("x-member-")) {
          rewriteResponse.headers.set(key, value);
        }
      });
      response = rewriteResponse;
    }
  } else {
    response = await updateSession(request);
  }

  // Apply nonce + dynamic CSP to all responses
  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
