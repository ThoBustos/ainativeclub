"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <Link href="/" className="block text-center">
          <div className="text-primary text-3xl font-mono">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </div>
        </Link>

        {/* Error Card */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6 text-center">
          <div className="text-4xl">⚠️</div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-6 rounded-md border border-border bg-background hover:bg-secondary transition-colors"
            >
              Go home
            </Link>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
