"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Member, Goal, LevelEvent, Session, ThomasFeedEntry, FeaturesEnabled } from "@/types";
import { xpToNextLevel } from "@/types";
import {
  activateMember, suspendMember, reactivateMember,
  addGoal, deleteGoal, approveGoal,
  grantXp,
  updateArrCurrent,
  addThomasFeedNote,
  scheduleSession, completeSession,
  updateFeature,
} from "@/app/actions/admin";

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:         "oklch(0.10 0.005 55)",
  surface:    "oklch(0.14 0.005 55)",
  surfaceLow: "oklch(0.12 0.004 55)",
  border:     "oklch(0.22 0.003 55)",
  borderSub:  "oklch(0.18 0.002 55)",
  amber:      "oklch(0.78 0.16 55)",
  fg:         "oklch(0.95 0 0)",
  fgMid:      "oklch(0.85 0 0)",
  fgMute:     "oklch(0.65 0 0)",
  fgDim:      "oklch(0.50 0 0)",
  red:        "oklch(0.65 0.18 25)",
  green:      "oklch(0.70 0.15 145)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };
const LABEL: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.fgMute,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtArr(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000 % 1 === 0 ? n / 1_000_000 : (n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDatetime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const btnPrimary: React.CSSProperties = {
  ...MONO, fontSize: 12, letterSpacing: "0.06em",
  background: T.amber, color: "oklch(0.12 0 0)",
  border: "none", borderRadius: 5, padding: "8px 16px", cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  ...MONO, fontSize: 12, letterSpacing: "0.06em",
  background: "transparent", color: T.fgMute,
  border: `1px solid ${T.border}`, borderRadius: 5, padding: "8px 16px", cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  ...MONO, fontSize: 12, letterSpacing: "0.06em",
  background: "transparent", color: T.red,
  border: `1px solid ${T.red}`, borderRadius: 5, padding: "8px 16px", cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  background: T.surfaceLow,
  border: `1px solid ${T.border}`,
  borderRadius: 5,
  padding: "8px 12px",
  ...SANS, fontSize: 13, color: T.fg, outline: "none",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-5 p-6"
      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6 }}
    >
      <span style={LABEL}>{title}</span>
      {children}
    </div>
  );
}

// ─── Goals section ────────────────────────────────────────────────────────────

function GoalsSection({ goals, memberId }: { goals: Goal[]; memberId: string }) {
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState("20");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const xpNum = parseInt(xp, 10);
    if (!title.trim() || isNaN(xpNum)) return;
    startTransition(async () => {
      await addGoal(memberId, title.trim(), xpNum);
      setTitle("");
      setXp("20");
    });
  }

  function handleApprove(goalId: string) {
    startTransition(async () => { await approveGoal(goalId, memberId); });
  }

  function handleDelete(goalId: string) {
    startTransition(async () => { await deleteGoal(goalId, memberId); });
  }

  const active = goals.filter(g => !g.completed_at);
  const completed = goals.filter(g => !!g.completed_at);

  return (
    <Section title="Goals">
      {/* Active goals */}
      {active.length > 0 && (
        <div className="flex flex-col gap-px" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
          {active.map(g => {
            const isPending = !!g.submitted_at;
            return (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3" style={{ background: T.surfaceLow }}>
                <div className="flex-1 min-w-0">
                  <span style={{ ...SANS, fontSize: 13, color: T.fg }}>{g.title}</span>
                  {isPending && (
                    <span style={{ ...MONO, fontSize: 11, color: T.amber, marginLeft: 8 }}>● submitted</span>
                  )}
                </div>
                <span style={{ ...MONO, fontSize: 12, color: T.amber, flexShrink: 0 }}>+{g.xp}XP</span>
                {isPending && (
                  <button onClick={() => handleApprove(g.id)} style={{ ...btnPrimary, padding: "4px 12px", fontSize: 11 }}>
                    APPROVE
                  </button>
                )}
                <button onClick={() => handleDelete(g.id)} style={{ ...MONO, fontSize: 11, color: T.fgDim, background: "none", border: "none", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {active.length === 0 && (
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute }}>No active goals.</p>
      )}

      {/* Add goal form */}
      <div className="flex flex-col gap-2">
        <span style={{ ...MONO, fontSize: 11, color: T.fgDim, letterSpacing: "0.08em" }}>ADD GOAL</span>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Goal title"
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={xp}
              onChange={e => setXp(e.target.value)}
              min={5} max={100}
              style={{ ...inputStyle, width: 72 }}
            />
            <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>XP</span>
          </div>
          <button onClick={handleAdd} disabled={!title.trim() || isPending} style={btnPrimary}>
            ADD
          </button>
        </div>
      </div>

      {/* Completed goals */}
      {completed.length > 0 && (
        <details>
          <summary style={{ ...MONO, fontSize: 11, color: T.fgMute, cursor: "pointer", letterSpacing: "0.06em" }}>
            {completed.length} COMPLETED
          </summary>
          <div className="flex flex-col gap-1 mt-2">
            {completed.map(g => (
              <div key={g.id} className="flex items-center gap-3 px-3 py-2" style={{ opacity: 0.5 }}>
                <span style={{ ...SANS, fontSize: 12, color: T.fgMid, textDecoration: "line-through", flex: 1 }}>{g.title}</span>
                <span style={{ ...MONO, fontSize: 11, color: T.fgDim }}>+{g.xp}XP</span>
                <span style={{ ...MONO, fontSize: 11, color: T.fgDim }}>{fmtDate(g.completed_at)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </Section>
  );
}

// ─── XP section ───────────────────────────────────────────────────────────────

function XpSection({ member, levelEvents }: { member: Member; levelEvents: LevelEvent[] }) {
  const [xp, setXp] = useState("25");
  const [action, setAction] = useState("");
  const [type, setType] = useState<"call_attended" | "manual_grant">("call_attended");
  const [isPending, startTransition] = useTransition();

  const xpNext = xpToNextLevel(member.arr_current);
  const pct = Math.min(100, Math.round((member.xp_current / xpNext) * 100));

  function handleGrant() {
    const xpNum = parseInt(xp, 10);
    if (isNaN(xpNum) || xpNum <= 0 || !action.trim()) return;
    startTransition(async () => {
      await grantXp(member.id, xpNum, action.trim(), type);
      setAction("");
    });
  }

  return (
    <Section title="Level + XP">
      {/* Current state */}
      <div className="flex items-center gap-5">
        <div
          className="flex items-center justify-center rounded-full flex-none"
          style={{ width: 52, height: 52, border: `2px solid ${T.amber}`, ...MONO, fontSize: 18, fontWeight: 700, color: T.amber }}
        >
          {member.level}
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex justify-between">
            <span style={{ ...MONO, fontSize: 12, color: T.fgMid }}>To Level {member.level + 1}</span>
            <span style={{ ...MONO, fontSize: 12, color: T.fgMid }}>{member.xp_current} / {xpNext} XP</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: T.border }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: T.amber }} />
          </div>
        </div>
      </div>

      {/* Grant form */}
      <div className="flex flex-col gap-2">
        <span style={{ ...MONO, fontSize: 11, color: T.fgDim, letterSpacing: "0.08em" }}>GRANT XP</span>
        <div className="flex gap-2 flex-wrap">
          <select
            value={type}
            onChange={e => {
              const v = e.target.value as "call_attended" | "manual_grant";
              setType(v);
              if (v === "call_attended") setXp("25");
            }}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="call_attended">Call attended (+25)</option>
            <option value="manual_grant">Manual grant</option>
          </select>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={xp}
              onChange={e => setXp(e.target.value)}
              min={1} max={200}
              style={{ ...inputStyle, width: 72 }}
            />
            <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>XP</span>
          </div>
        </div>
        <input
          type="text"
          value={action}
          onChange={e => setAction(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGrant()}
          placeholder="Label (shown in member's history drawer)"
          style={{ ...inputStyle, width: "100%" }}
        />
        <div>
          <button onClick={handleGrant} disabled={!action.trim() || isPending} style={btnPrimary}>
            GRANT XP
          </button>
        </div>
      </div>

      {/* Recent events */}
      {levelEvents.length > 0 && (
        <div className="flex flex-col gap-px" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
          {levelEvents.slice(0, 5).map(e => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3" style={{ background: T.surfaceLow }}>
              <span style={{ ...MONO, fontSize: 11, color: T.fgDim, whiteSpace: "nowrap" }}>
                {fmtDate(e.created_at)}
              </span>
              <span style={{ ...SANS, fontSize: 12, color: T.fgMid, flex: 1 }}>{e.action}</span>
              <span style={{ ...MONO, fontSize: 11, color: T.amber }}>+{e.xp}XP</span>
              <span style={{ ...MONO, fontSize: 11, color: T.fgDim }}>L{e.level_after}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── ARR section ──────────────────────────────────────────────────────────────

function ArrSection({ member }: { member: Member }) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const arrHistory = Array.isArray(member.arr_history)
    ? (member.arr_history as { date: string; value: number; note: string }[])
    : [];

  const arrPct = member.arr_target > 0
    ? Math.min(100, Math.round((member.arr_current / member.arr_target) * 100))
    : 0;

  function handleUpdate() {
    const v = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(v) || v < 0) return;
    startTransition(async () => {
      await updateArrCurrent(member.id, v, note.trim() || `$${v.toLocaleString()}`);
      setValue("");
      setNote("");
    });
  }

  return (
    <Section title="ARR">
      {/* Current */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: T.fg }}>{fmtArr(member.arr_current)}</span>
          <span style={{ ...MONO, fontSize: 14, color: T.fgMute }}>→ {fmtArr(member.arr_target)}</span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
          <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
        </div>
        <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{arrPct}% to next milestone</span>
      </div>

      {/* Update form */}
      <div className="flex flex-col gap-2">
        <span style={{ ...MONO, fontSize: 11, color: T.fgDim, letterSpacing: "0.08em" }}>UPDATE ARR</span>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <span style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              ...MONO, fontSize: 13, color: T.fgMute, pointerEvents: "none",
            }}>$</span>
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={e => setValue(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              style={{ ...inputStyle, paddingLeft: 22, width: "100%" }}
            />
          </div>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUpdate()}
            placeholder="Note (e.g. Closed 3 contracts)"
            style={{ ...inputStyle, flex: 2, minWidth: 180 }}
          />
          <button onClick={handleUpdate} disabled={!value || isPending} style={btnPrimary}>
            UPDATE
          </button>
        </div>
      </div>

      {/* History */}
      {arrHistory.length > 0 && (
        <div className="flex flex-col gap-px" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
          {[...arrHistory].reverse().slice(0, 6).map((entry, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ background: T.surfaceLow }}>
              <span style={{ ...MONO, fontSize: 11, color: T.fgDim }}>{entry.date}</span>
              <span style={{ ...MONO, fontSize: 13, fontWeight: 600, color: T.fgMid }}>{fmtArr(entry.value)}</span>
              {entry.note && <span style={{ ...SANS, fontSize: 12, color: T.fgMute, flex: 1 }}>{entry.note}</span>}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Thomas Feed section ──────────────────────────────────────────────────────

function FeedSection({ memberId, feed }: { memberId: string; feed: ThomasFeedEntry[] }) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!note.trim()) return;
    startTransition(async () => {
      await addThomasFeedNote(memberId, note.trim());
      setNote("");
    });
  }

  return (
    <Section title="Thomas Feed">
      <div className="flex flex-col gap-2">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write a note visible to this member..."
          rows={3}
          style={{ ...inputStyle, width: "100%", resize: "vertical", lineHeight: 1.5 }}
        />
        <div>
          <button onClick={handleAdd} disabled={!note.trim() || isPending} style={btnPrimary}>
            POST NOTE
          </button>
        </div>
      </div>

      {feed.length > 0 && (
        <div className="flex flex-col gap-px" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
          {feed.map(entry => (
            <div key={entry.id} className="flex flex-col gap-1 px-4 py-3" style={{ background: T.surfaceLow }}>
              <p style={{ ...SANS, fontSize: 13, color: T.fgMid, lineHeight: 1.5 }}>{entry.note}</p>
              <span style={{ ...MONO, fontSize: 10, color: T.fgDim }}>{fmtDate(entry.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─── Sessions section ─────────────────────────────────────────────────────────

function SessionsSection({ sessions, memberId }: { sessions: Session[]; memberId: string }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSchedule() {
    if (!scheduledAt) return;
    startTransition(async () => {
      await scheduleSession(memberId, new Date(scheduledAt).toISOString());
      setScheduledAt("");
    });
  }

  function handleComplete(sessionId: string) {
    startTransition(async () => {
      await completeSession(sessionId, memberId, completionNotes.trim());
      setCompletingId(null);
      setCompletionNotes("");
    });
  }

  const upcoming = sessions.filter(s => !s.completed_at);
  const past = sessions.filter(s => !!s.completed_at);

  return (
    <Section title="Sessions">
      {/* Schedule new */}
      <div className="flex flex-col gap-2">
        <span style={{ ...MONO, fontSize: 11, color: T.fgDim, letterSpacing: "0.08em" }}>SCHEDULE SESSION</span>
        <div className="flex gap-2 flex-wrap">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
          <button onClick={handleSchedule} disabled={!scheduledAt || isPending} style={btnPrimary}>
            SCHEDULE
          </button>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-px" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
          {upcoming.map(s => (
            <div key={s.id} className="flex flex-col gap-2 px-4 py-3" style={{ background: T.surfaceLow }}>
              <div className="flex items-center justify-between gap-3">
                <span style={{ ...MONO, fontSize: 13, color: T.fg }}>{fmtDatetime(s.scheduled_at)}</span>
                <button
                  onClick={() => setCompletingId(completingId === s.id ? null : s.id)}
                  style={btnSecondary}
                >
                  MARK COMPLETE
                </button>
              </div>
              {completingId === s.id && (
                <div className="flex flex-col gap-2 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
                  <textarea
                    value={completionNotes}
                    onChange={e => setCompletionNotes(e.target.value)}
                    placeholder="Session notes (optional)..."
                    rows={2}
                    style={{ ...inputStyle, width: "100%", resize: "vertical", lineHeight: 1.5 }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleComplete(s.id)} disabled={isPending} style={btnPrimary}>
                      COMPLETE + GRANT 25 XP
                    </button>
                    <button onClick={() => setCompletingId(null)} style={btnSecondary}>
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past sessions */}
      {past.length > 0 && (
        <details>
          <summary style={{ ...MONO, fontSize: 11, color: T.fgMute, cursor: "pointer", letterSpacing: "0.06em" }}>
            {past.length} PAST SESSION{past.length > 1 ? "S" : ""}
          </summary>
          <div className="flex flex-col gap-px mt-2" style={{ background: T.border, borderRadius: 5, overflow: "hidden" }}>
            {past.map(s => (
              <div key={s.id} className="flex flex-col gap-1 px-4 py-3" style={{ background: T.surfaceLow }}>
                <span style={{ ...MONO, fontSize: 12, color: T.fgMid }}>{fmtDatetime(s.scheduled_at)}</span>
                {s.notes && <p style={{ ...SANS, fontSize: 12, color: T.fgMute, lineHeight: 1.4 }}>{s.notes}</p>}
              </div>
            ))}
          </div>
        </details>
      )}
    </Section>
  );
}

// ─── Features section ─────────────────────────────────────────────────────────

const FEATURE_LABELS: { key: keyof FeaturesEnabled; label: string; hint: string }[] = [
  { key: "session_log",  label: "Session Log",  hint: "After first completed call" },
  { key: "insights",     label: "Insights",     hint: "Level 10+ or manual" },
  { key: "playbooks",    label: "Playbooks",    hint: "Thomas publishes one for you" },
  { key: "community",    label: "Community",    hint: "Thomas grants manually" },
  { key: "peer_calls",   label: "Peer Calls",   hint: "Thomas schedules manually" },
];

function FeaturesSection({ member }: { member: Member }) {
  const features: FeaturesEnabled = (member.features_enabled as FeaturesEnabled) ?? {
    session_log: false, insights: false, playbooks: false, community: false, peer_calls: false,
  };
  const [isPending, startTransition] = useTransition();

  function handleToggle(feature: keyof FeaturesEnabled, enabled: boolean) {
    startTransition(async () => { await updateFeature(member.id, feature, enabled); });
  }

  return (
    <Section title="Features">
      <div className="flex flex-col gap-3">
        {FEATURE_LABELS.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span style={{ ...MONO, fontSize: 13, color: features[key] ? T.fg : T.fgMute }}>{label}</span>
              <span style={{ ...SANS, fontSize: 11, color: T.fgDim }}>{hint}</span>
            </div>
            <button
              onClick={() => handleToggle(key, !features[key])}
              disabled={isPending}
              style={{
                ...MONO, fontSize: 11, letterSpacing: "0.08em",
                background: features[key] ? T.amber : T.surfaceLow,
                color: features[key] ? "oklch(0.12 0 0)" : T.fgMute,
                border: `1px solid ${features[key] ? "transparent" : T.border}`,
                borderRadius: 4, padding: "5px 14px", cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {features[key] ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Main MemberDetail ────────────────────────────────────────────────────────

interface MemberDetailProps {
  member: Member;
  goals: Goal[];
  levelEvents: LevelEvent[];
  sessions: Session[];
  thomasFeed: ThomasFeedEntry[];
}

export function MemberDetail({ member, goals, levelEvents, sessions, thomasFeed }: MemberDetailProps) {
  const [isPending, startTransition] = useTransition();
  const displayName = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
  const arrPct = member.arr_target > 0 ? Math.min(100, Math.round((member.arr_current / member.arr_target) * 100)) : 0;

  return (
    <div className="px-5 py-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/admin"
        style={{ ...MONO, fontSize: 11, color: T.fgMute, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}
        className="hover:opacity-75 transition-opacity"
      >
        ← ALL MEMBERS
      </Link>

      {/* Header card */}
      <div
        className="flex flex-col gap-4 p-6 mb-6"
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 style={{ ...MONO, fontSize: 20, fontWeight: 700, color: T.fg }}>{displayName}</h1>
              <span style={{
                ...MONO, fontSize: 9, letterSpacing: "0.1em",
                color: member.status === "active" ? T.green : member.status === "suspended" ? T.red : T.amber,
                background: member.status === "active" ? "oklch(0.15 0.05 145)" : member.status === "suspended" ? "oklch(0.15 0.05 25)" : "oklch(0.15 0.08 55)",
                padding: "2px 8px", borderRadius: 3,
              }}>
                {(member.status ?? "pending").toUpperCase()}
              </span>
              {!member.onboarded_at && member.status === "active" && (
                <span style={{ ...MONO, fontSize: 9, color: T.amber, letterSpacing: "0.1em", background: "oklch(0.15 0.08 55)", padding: "2px 8px", borderRadius: 3 }}>
                  AWAITING ACTIVATION
                </span>
              )}
            </div>
            <span style={{ ...SANS, fontSize: 13, color: T.fgMute }}>{member.email}</span>
            {member.company && <span style={{ ...SANS, fontSize: 13, color: T.fgMute }}>{member.company}</span>}
          </div>

          {/* Level badge */}
          <div
            className="flex items-center justify-center rounded-full flex-none"
            style={{ width: 48, height: 48, border: `2px solid ${T.amber}`, ...MONO, fontSize: 16, fontWeight: 700, color: T.amber }}
          >
            {member.level}
          </div>
        </div>

        {/* ARR mini bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span style={{ ...MONO, fontSize: 13, fontWeight: 600, color: T.fgMid }}>{fmtArr(member.arr_current)}</span>
            <span style={{ ...MONO, fontSize: 12, color: T.fgMute }}>{fmtArr(member.arr_target)}</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
            <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span style={{ ...MONO, fontSize: 11, color: T.fgDim }}>
            Joined {fmtDate(member.created_at)}
          </span>
          <span style={{ ...MONO, fontSize: 11, color: member.onboarded_at ? T.fgDim : T.amber }}>
            {member.onboarded_at ? `Activated ${fmtDate(member.onboarded_at)}` : "Not activated"}
          </span>
          {member.bio && (
            <span style={{ ...SANS, fontSize: 12, color: T.fgMute, width: "100%", marginTop: 4 }}>
              <span style={{ ...MONO, fontSize: 10, color: T.fgDim, letterSpacing: "0.08em" }}>OBSTACLE: </span>
              {member.bio}
            </span>
          )}
        </div>

        {/* Activate button */}
        {!member.onboarded_at && member.status === "active" && (
          <div className="pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
            <button
              onClick={() => startTransition(async () => { await activateMember(member.id); })}
              disabled={isPending}
              style={btnPrimary}
            >
              ACTIVATE PORTAL
            </button>
            <p style={{ ...SANS, fontSize: 12, color: T.fgMute, marginTop: 6 }}>
              Sets onboarded_at — member sees full dashboard immediately.
            </p>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        <GoalsSection goals={goals} memberId={member.id} />
        <XpSection member={member} levelEvents={levelEvents} />
        <ArrSection member={member} />
        <FeedSection memberId={member.id} feed={thomasFeed} />
        <SessionsSection sessions={sessions} memberId={member.id} />
        <FeaturesSection member={member} />

        {/* Danger zone */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ background: T.surface, border: `1px solid ${T.red}`, borderRadius: 6 }}
        >
          <span style={{ ...MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.red }}>
            Danger Zone
          </span>
          {member.status === "active" ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span style={{ ...SANS, fontSize: 13, color: T.fgMid }}>Suspend member</span>
                <p style={{ ...SANS, fontSize: 12, color: T.fgMute }}>
                  Blocks portal access immediately. Reversible.
                </p>
              </div>
              <button
                onClick={() => startTransition(async () => { await suspendMember(member.id); })}
                disabled={isPending}
                style={btnDanger}
              >
                SUSPEND
              </button>
            </div>
          ) : member.status === "suspended" ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span style={{ ...SANS, fontSize: 13, color: T.fgMid }}>Reactivate member</span>
                <p style={{ ...SANS, fontSize: 12, color: T.fgMute }}>Restores portal access.</p>
              </div>
              <button
                onClick={() => startTransition(async () => { await reactivateMember(member.id); })}
                disabled={isPending}
                style={{ ...btnPrimary }}
              >
                REACTIVATE
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
