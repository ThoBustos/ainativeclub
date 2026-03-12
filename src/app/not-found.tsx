import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="text-primary text-3xl font-mono">
          <span>{">"}</span>
          <span className="animate-blink">_</span>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-primary">$</span> ls ./that-page/
          </p>
          <p className="font-mono text-destructive text-sm">
            ls: ./that-page/: No such file or directory
          </p>
          <h1 className="text-xl font-bold">404 · Page not found</h1>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
