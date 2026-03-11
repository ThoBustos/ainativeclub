import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:         "oklch(0.10 0.005 55)",
  surface:    "oklch(0.14 0.005 55)",
  border:     "oklch(0.22 0.003 55)",
  amber:      "oklch(0.78 0.16 55)",
  fgMid:      "oklch(0.85 0 0)",
  fgMute:     "oklch(0.65 0 0)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const role = headersList.get("x-member-role");

  // Hard gate — only admin role can access /admin
  if (role !== "admin") {
    redirect("/portal");
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: T.bg }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 flex-none"
        style={{ height: 44, background: T.bg, borderBottom: `1px solid ${T.border}` }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
          <span style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.amber }}>
            {">"}<span className="animate-blink">_</span>
          </span>
          <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: T.fgMid, letterSpacing: "0.05em" }}>
            AI Native Club
          </span>
        </Link>

        {/* Admin nav */}
        <nav className="flex items-center gap-5">
          <Link
            href="/admin"
            style={{ ...MONO, fontSize: 11, color: T.fgMute, letterSpacing: "0.08em" }}
            className="hover:opacity-75 transition-opacity"
          >
            MEMBERS
          </Link>
          <Link
            href="/admin/applications"
            style={{ ...MONO, fontSize: 11, color: T.fgMute, letterSpacing: "0.08em" }}
            className="hover:opacity-75 transition-opacity"
          >
            APPLICATIONS
          </Link>
          <Link
            href="/portal"
            style={{ ...MONO, fontSize: 11, color: T.fgMute, letterSpacing: "0.08em" }}
            className="hover:opacity-75 transition-opacity"
          >
            ← PORTAL
          </Link>
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
