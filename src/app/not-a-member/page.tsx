import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function NotAMemberPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Use service role client for privileged queries
  const adminClient = createAdminClient();

  // Check if they're actually a member (in case they navigate here directly)
  const { data: member } = await adminClient
    .from("members")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  // If they're an active member, redirect to portal
  if (member && member.status === "active") {
    redirect("/portal");
  }

  // Check if they have a pending application (using service role to bypass RLS)
  const { data: application } = await adminClient
    .from("applications")
    .select("id, status, first_name")
    .eq("email", user.email!)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <Link href="/" className="block text-center">
          <div className="text-primary text-3xl font-mono">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6 text-center">
          {application ? (
            // Has an application
            <>
              <div className="text-4xl">
                {application.status === "pending" && "⏳"}
                {application.status === "reviewing" && "👀"}
                {application.status === "rejected" && "😔"}
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold">
                  {application.status === "pending" && "Application Received"}
                  {application.status === "reviewing" && "Under Review"}
                  {application.status === "rejected" && "Application Not Accepted"}
                </h1>

                <p className="text-sm text-muted-foreground">
                  {application.status === "pending" && (
                    <>
                      Thanks for applying{application.first_name ? `, ${application.first_name}` : ""}!
                      We&apos;ll review your application and get back to you soon.
                    </>
                  )}
                  {application.status === "reviewing" && (
                    <>
                      Your application is being reviewed.
                      We&apos;ll be in touch shortly.
                    </>
                  )}
                  {application.status === "rejected" && (
                    <>
                      Unfortunately, we weren&apos;t able to accept your application at this time.
                      Feel free to reach out if you have questions.
                    </>
                  )}
                </p>
              </div>

              <div className="pt-2 text-xs text-muted-foreground">
                Signed in as {user.email}
              </div>
            </>
          ) : (
            // No application yet
            <>
              <div className="text-4xl">🚪</div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold">Members Only</h1>
                <p className="text-sm text-muted-foreground">
                  The AI Native Club portal is exclusive to approved members.
                  You&apos;re signed in, but you&apos;re not a member yet.
                </p>
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Apply to Join
              </Link>

              <div className="pt-2 text-xs text-muted-foreground">
                Signed in as {user.email}
              </div>
            </>
          )}

          {/* Sign out */}
          <form action="/auth/signout" method="post" className="pt-2">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
