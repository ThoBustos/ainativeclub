import { NextRequest, NextResponse } from "next/server";
import { updateSession, isAppSubdomain } from "@/lib/supabase/middleware";

function buildCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isApp = isAppSubdomain(host);
  const pathname = request.nextUrl.pathname;

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

  // TODO: wire nonce to layout <script> tags before switching to nonce-based CSP
  response.headers.set("Content-Security-Policy", buildCsp());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
