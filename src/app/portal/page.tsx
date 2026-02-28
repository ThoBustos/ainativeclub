import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main id="main-content" className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-primary text-xl font-mono">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome to the Portal</h1>
            <p className="text-muted-foreground mt-2">
              You&apos;re signed in as {user.email}
            </p>
          </div>

          {/* Placeholder content */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-center py-12 space-y-4">
              <div className="text-4xl">🚧</div>
              <h2 className="text-lg font-medium">Portal Under Construction</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;re building something great here. Soon you&apos;ll be able to
                see your calls, track your goals, and chat with your AI assistant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
