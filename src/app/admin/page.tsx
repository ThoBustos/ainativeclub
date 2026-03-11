import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeaturesEnabled } from "@/types";

const T = {
  bg:         "oklch(0.10 0.005 55)",
  surface:    "oklch(0.14 0.005 55)",
  surfaceLow: "oklch(0.12 0.004 55)",
  border:     "oklch(0.22 0.003 55)",
  amber:      "oklch(0.78 0.16 55)",
  fg:         "oklch(0.95 0 0)",
  fgMid:      "oklch(0.85 0 0)",
  fgMute:     "oklch(0.65 0 0)",
  fgDim:      "oklch(0.50 0 0)",
  red:        "oklch(0.65 0.18 25)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };
const LABEL: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.fgMute,
};

function fmtArr(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000 % 1 === 0 ? n / 1_000_000 : (n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default async function AdminPage() {
  const db = createAdminClient();

  const [membersRes, goalsRes] = await Promise.all([
    db.from("members")
      .select("id, first_name, last_name, email, company, level, xp_current, arr_current, arr_target, status, onboarded_at, next_call_at, role")
      .order("onboarded_at", { ascending: true, nullsFirst: true }),
    db.from("goals")
      .select("member_id, submitted_at, completed_at"),
  ]);

  const members = membersRes.data ?? [];
  const goals = goalsRes.data ?? [];

  // Count pending goals (submitted but not completed) per member
  const pendingByMember = goals.reduce<Record<string, number>>((acc, g) => {
    if (g.submitted_at && !g.completed_at) {
      acc[g.member_id] = (acc[g.member_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span style={LABEL}>Admin</span>
          <h1 style={{ ...MONO, fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 4 }}>
            Members
          </h1>
        </div>
        <span style={{ ...MONO, fontSize: 12, color: T.fgMute }}>
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      {/* Members list */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p style={{ ...SANS, fontSize: 14, color: T.fgMute }}>No members yet.</p>
          <Link
            href="/admin/applications"
            style={{ ...MONO, fontSize: 12, color: T.amber, letterSpacing: "0.06em" }}
          >
            Review applications →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-px" style={{ background: T.border, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
          {members.map((m) => {
            const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
            const arrPct = m.arr_target > 0 ? Math.min(100, Math.round((m.arr_current / m.arr_target) * 100)) : 0;
            const pending = pendingByMember[m.id] ?? 0;
            const needsActivation = !m.onboarded_at;
            const noCallScheduled = !m.next_call_at;
            const callDays = m.next_call_at ? daysUntil(m.next_call_at) : null;
            const callPast = callDays !== null && callDays < 0;
            const isSuspended = m.status === "suspended";

            return (
              <Link
                key={m.id}
                href={`/admin/members/${m.id}`}
                className="flex items-center gap-5 px-5 py-4 hover:opacity-80 transition-opacity"
                style={{ background: T.surface, textDecoration: "none" }}
              >
                {/* Name + company */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ ...MONO, fontSize: 13, fontWeight: 600, color: isSuspended ? T.fgDim : T.fg }}>
                      {name}
                    </span>
                    {isSuspended && (
                      <span style={{ ...MONO, fontSize: 9, color: T.red, letterSpacing: "0.1em", background: "oklch(0.15 0.05 25)", padding: "1px 6px", borderRadius: 3 }}>
                        SUSPENDED
                      </span>
                    )}
                    {needsActivation && !isSuspended && (
                      <span style={{ ...MONO, fontSize: 9, color: T.amber, letterSpacing: "0.1em", background: "oklch(0.15 0.08 55)", padding: "1px 6px", borderRadius: 3 }}>
                        NEEDS ACTIVATION
                      </span>
                    )}
                    {pending > 0 && (
                      <span style={{ ...MONO, fontSize: 9, color: T.amber, letterSpacing: "0.1em", background: "oklch(0.15 0.08 55)", padding: "1px 6px", borderRadius: 3 }}>
                        {pending} PENDING GOAL{pending > 1 ? "S" : ""}
                      </span>
                    )}
                  </div>
                  <span style={{ ...SANS, fontSize: 12, color: T.fgMute }}>
                    {m.company || m.email}
                  </span>
                </div>

                {/* ARR progress */}
                <div className="hidden sm:flex flex-col gap-1 w-32">
                  <div className="flex justify-between">
                    <span style={{ ...MONO, fontSize: 11, color: T.fgMid }}>{fmtArr(m.arr_current)}</span>
                    <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{fmtArr(m.arr_target)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
                    <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
                  </div>
                </div>

                {/* Level */}
                <div
                  className="hidden sm:flex items-center justify-center rounded-full flex-none"
                  style={{ width: 32, height: 32, border: `1.5px solid ${T.amber}`, ...MONO, fontSize: 12, fontWeight: 700, color: T.amber }}
                >
                  {m.level}
                </div>

                {/* Next call */}
                <div className="hidden md:flex flex-col items-end gap-0.5 flex-none">
                  <span style={{ ...MONO, fontSize: 11, color: (noCallScheduled || callPast) ? T.red : T.fgMid }}>
                    {noCallScheduled ? "No call" : fmtDate(m.next_call_at)}
                  </span>
                  {callDays !== null && callDays >= 0 && (
                    <span style={{ ...MONO, fontSize: 10, color: T.fgMute }}>{callDays}d</span>
                  )}
                  {callPast && (
                    <span style={{ ...MONO, fontSize: 10, color: T.red }}>past</span>
                  )}
                </div>

                {/* Chevron */}
                <span style={{ ...MONO, fontSize: 14, color: T.fgDim }}>›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
