"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function useClientUrls() {
  const [urls, setUrls] = useState({
    isAppSubdomain: false,
    mainSiteUrl: (path: string) => path,
  });

  useEffect(() => {
    const host = window.location.host;
    const protocol = window.location.protocol;
    const isApp = host.startsWith("app.");

    const getMainSiteUrl = (path: string = "/") => {
      if (host.includes("localhost")) {
        return `${protocol}//localhost:4015${path}`;
      }
      return `${protocol}//www.ainativeclub.com${path}`;
    };

    setUrls({ isAppSubdomain: isApp, mainSiteUrl: getMainSiteUrl });
  }, []);

  return urls;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const { isAppSubdomain, mainSiteUrl } = useClientUrls();
  // On app subdomain, default redirect is "/" (which shows portal)
  const defaultRedirect = isAppSubdomain ? "/" : "/portal";
  const redirect = searchParams.get("redirect") || defaultRedirect;
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    setIsLoading(false);

    if (!error) {
      setMagicLinkSent(true);
    }
  };

  if (magicLinkSent) {
    return (
      <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <a href={mainSiteUrl("/")} className="block text-center">
            <div className="text-primary text-3xl font-mono">
              <span>{">"}</span>
              <span className="animate-blink">_</span>
            </div>
          </a>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-center">
            <div className="text-2xl">✉️</div>
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a login link to <span className="text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to sign in. The link expires in 1 hour.
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Try a different email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <a href={mainSiteUrl("/")} className="block text-center">
          <div className="text-primary text-3xl font-mono">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </div>
        </a>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold">Member Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your portal
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error === "not_a_member"
                ? "You need to be an approved member to access the portal."
                : "Authentication failed. Please try again."}
            </div>
          )}

          {message && (
            <div className="bg-primary/10 text-primary text-sm p-3 rounded-md">
              {message}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-md border border-border bg-background hover:bg-secondary transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                or use email
              </span>
            </div>
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-11 px-4 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                Members only
              </span>
            </div>
          </div>

          {/* Not a member */}
          <div className="text-center text-sm text-muted-foreground">
            Not a member yet?{" "}
            <a
              href={mainSiteUrl("/apply")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Apply to join
            </a>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <a
            href={mainSiteUrl("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
