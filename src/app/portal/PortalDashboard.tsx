"use client";

import { useState, useOptimistic, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, MessageSquare, X, ChevronRight, LogOut } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import type { PortalData, Goal, LevelEvent, ThomasFeedEntry, FeaturesEnabled, Message, ArrHistoryEntry, Call } from "@/types";
import { xpToNextLevel, prevArrRung } from "@/types";
import { fmtArr } from "@/lib/format";
import { toggleGoalSubmitted } from "@/app/actions/portal";

// ─── Design tokens ────────────────────────────────────────────────────────────
// All contrast ratios tested against bg oklch(0.10 0.005 55)

const T = {
  bg:         "oklch(0.10 0.005 55)",
  surface:    "oklch(0.14 0.005 55)",
  surfaceLow: "oklch(0.12 0.004 55)",
  border:     "oklch(0.22 0.003 55)",
  borderSub:  "oklch(0.18 0.002 55)",
  amber:      "oklch(0.78 0.16 55)",   // accent — signal only
  fg:         "oklch(0.95 0 0)",        // ~18:1 — primary text
  fgMid:      "oklch(0.85 0 0)",        // ~12:1 — secondary text
  fgMute:     "oklch(0.65 0 0)",        // ~5.5:1 — labels, tertiary (WCAG AA)
  fgDim:      "oklch(0.50 0 0)",        // ~3.5:1 — locked states (WCAG AA large)
};

// ─── Font helpers ─────────────────────────────────────────────────────────────
// MONO: data, labels, numbers, system voice
// SANS: human text — task titles, chat messages, feed notes

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };

const LABEL: React.CSSProperties = {
  ...MONO,
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: T.fgMute,
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

const TOP_H = 44;

function TopBar({ name, role, onLogout }: { name: string; role?: string | null; onLogout: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-5 flex-none"
      style={{ height: TOP_H, background: T.bg, borderBottom: `1px solid ${T.border}` }}
    >
      <Link href="/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
        <span style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.amber }}>
          {">"}<span className="animate-blink">_</span>
        </span>
        <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: T.fgMid, letterSpacing: "0.05em" }}>
          AI Native Club
        </span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <span className="truncate max-w-[100px] sm:max-w-none" style={{ ...MONO, fontSize: 11, color: T.fgMute, letterSpacing: "0.06em" }}>
          {name.toUpperCase()}
        </span>
        {role === "admin" && (
          <Link
            href="/admin"
            className="hover:opacity-75 transition-opacity"
            style={{ ...MONO, fontSize: 11, color: T.amber, letterSpacing: "0.08em" }}
          >
            ADMIN
          </Link>
        )}
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
          style={{ ...MONO, fontSize: 11, color: T.fgMute, cursor: "pointer", letterSpacing: "0.08em" }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          <span>LOGOUT</span>
        </button>
      </div>
    </div>
  );
}

// ─── Locked tile ──────────────────────────────────────────────────────────────

function LockedTile({ label, teaser }: { label?: string; teaser?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2.5 px-6 text-center"
      style={{ background: T.surfaceLow }}
    >
      <Lock size={16} strokeWidth={1.5} style={{ color: T.fgMute }} />
      {label && (
        <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.fgMute }}>
          {label}
        </span>
      )}
      {teaser && (
        <span style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4, maxWidth: 200 }}>
          {teaser}
        </span>
      )}
    </div>
  );
}

// ─── Thomas Feed tile ─────────────────────────────────────────────────────────

function ThomasFeedTile({ entries }: { entries: ThomasFeedEntry[] }) {
  const latest = entries[0];
  return (
    <div className="flex flex-col gap-3 p-5 h-full" style={{ background: T.surfaceLow }}>
      <span style={LABEL}>Thomas Feed</span>
      <p style={{ ...SANS, fontSize: 13, color: T.fgMid, lineHeight: 1.5, flex: 1 }}>
        {latest.note}
      </p>
      <span style={{ ...MONO, fontSize: 10, color: T.fgMute }}>
        {fmtDate(latest.created_at)}
        {entries.length > 1 && ` · ${entries.length - 1} more`}
      </span>
    </div>
  );
}

// ─── Transcript Drawer ────────────────────────────────────────────────────────

function TranscriptDrawer({ call, onClose }: { call: Call; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(call.raw_text ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "oklch(0 0 0 / 0.55)" }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col w-full sm:w-[480px]"
        style={{ background: T.surfaceLow, borderLeft: `1px solid ${T.border}` }}
      >
        <div className="flex items-start justify-between px-6 py-5 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex flex-col gap-1">
            <span style={LABEL}>Transcript</span>
            <p style={{ ...MONO, fontSize: 14, fontWeight: 600, color: T.fg }}>
              {fmtDate(call.call_date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              style={{
                ...MONO, fontSize: 11, letterSpacing: "0.06em",
                background: "transparent", color: copied ? "oklch(0.70 0.15 145)" : T.fgMute,
                border: `1px solid ${copied ? "oklch(0.70 0.15 145)" : T.border}`,
                borderRadius: 4, padding: "5px 12px", cursor: "pointer",
              }}
            >
              {copied ? "COPIED" : "COPY"}
            </button>
            <button onClick={onClose} style={{ color: T.fgMute, cursor: "pointer" }} aria-label="Close">
              <X size={17} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {call.summary && (
          <div className="px-6 py-4 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
            <p style={{ ...SANS, fontSize: 13, color: T.fgMid, lineHeight: 1.5 }}>{call.summary}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre style={{
            ...MONO, fontSize: 12, color: T.fgMute, lineHeight: 1.6,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {call.raw_text}
          </pre>
        </div>
      </aside>
    </>
  );
}

// ─── Session Log tile ─────────────────────────────────────────────────────────

function SessionLogTile({ calls }: { calls: Call[] }) {
  const [openCall, setOpenCall] = useState<Call | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: T.surfaceLow }}>
      <div className="px-5 pt-5 pb-3 flex-none">
        <span style={LABEL}>Session Log</span>
      </div>

      {/* Past calls */}
      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <p style={{ ...SANS, fontSize: 12, color: T.fgDim, padding: "12px 20px", lineHeight: 1.4 }}>
            No completed sessions yet.
          </p>
        ) : (
          calls.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-1 px-5 py-2.5"
              style={{ borderBottom: `1px solid ${T.borderSub}` }}
            >
              <span style={{ ...MONO, fontSize: 12, color: T.fgMid }}>{fmtDate(c.call_date)}</span>
              {c.summary && (
                <p style={{ ...SANS, fontSize: 11, color: T.fgMute, lineHeight: 1.4 }}
                   className="line-clamp-2">
                  {c.summary}
                </p>
              )}
              {c.raw_text && (
                <button
                  onClick={() => setOpenCall(c)}
                  style={{
                    ...MONO, fontSize: 10, letterSpacing: "0.06em",
                    background: "transparent", color: T.fgDim,
                    border: "none", padding: 0, cursor: "pointer",
                    textAlign: "left", width: "fit-content",
                  }}
                >
                  VIEW TRANSCRIPT
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {openCall && (
        <TranscriptDrawer
          call={openCall}
          onClose={() => setOpenCall(null)}
        />
      )}
    </div>
  );
}

// ─── Goals section ────────────────────────────────────────────────────────────

function GoalsSection({ goals, mobile = false }: { goals: Goal[]; mobile?: boolean }) {
  const [optimisticGoals, updateOptimistic] = useOptimistic(
    goals,
    (state, { id, submitted }: { id: string; submitted: boolean }) =>
      state.map(g => g.id === id ? { ...g, submitted_at: submitted ? new Date().toISOString() : null } : g)
  );
  const [, startTransition] = useTransition();

  function toggle(goal: Goal) {
    if (goal.completed_at) return; // completed goals are locked
    const newSubmitted = goal.submitted_at === null;
    startTransition(async () => {
      updateOptimistic({ id: goal.id, submitted: newSubmitted });
      await toggleGoalSubmitted(goal.id, newSubmitted);
    });
  }

  const pendingCount = optimisticGoals.filter(g => g.submitted_at && !g.completed_at).length;
  const completedCount = optimisticGoals.filter(g => !!g.completed_at).length;
  const total = optimisticGoals.length;

  if (total === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 px-6 text-center ${mobile ? "py-10" : "h-full"}`}
        style={{ background: T.bg }}
      >
        <span style={LABEL}>Current Goals</span>
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute, marginTop: 8 }}>No goals set yet.</p>
        <p style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4, maxWidth: 200 }}>
          Thomas will add goals after your first session.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${mobile ? "" : "h-full"}`} style={{ background: T.bg }}>
      {/* Section header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-none"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <span style={LABEL}>Current Goals</span>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span style={{ ...MONO, fontSize: 11, color: T.amber }}>
              {pendingCount} pending approval
            </span>
          )}
          <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>
            {completedCount} / {total}
          </span>
        </div>
      </div>

      {/* Goals list */}
      <div className="flex-1 overflow-y-auto">
        {optimisticGoals.map((goal, i) => {
          const isSubmitted = goal.submitted_at !== null && goal.completed_at === null;
          const isCompleted = goal.completed_at !== null;
          const isDimmed = isSubmitted || isCompleted;

          return (
            <div
              key={goal.id}
              className="flex items-center gap-4 px-6"
              style={{
                height: 80,
                borderBottom: i < optimisticGoals.length - 1 ? `1px solid ${T.borderSub}` : "none",
                opacity: isDimmed ? 0.5 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {/* Circle toggle — 44px tap area, 20px visual */}
              <button
                onClick={() => toggle(goal)}
                disabled={isCompleted}
                aria-label={isSubmitted ? "Unmark as done" : "Mark as done"}
                style={{
                  flexShrink: 0,
                  width: 44, height: 44,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  cursor: isCompleted ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 20, height: 20,
                    borderRadius: "50%",
                    border: `1.5px solid ${isDimmed ? T.amber : T.fgDim}`,
                    background: isDimmed ? T.amber : "transparent",
                    transition: "all 0.15s ease",
                    pointerEvents: "none",
                  }}
                >
                  {isDimmed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="oklch(0.12 0 0)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Title + status */}
              <div className="flex-1 flex flex-col gap-0.5">
                <span
                  style={{
                    ...SANS, fontSize: 14,
                    color: isDimmed ? T.fgDim : T.fg,
                    textDecoration: isCompleted ? "line-through" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {goal.title}
                </span>
                {isSubmitted && (
                  <span style={{ ...SANS, fontSize: 12, color: T.fgMute, fontStyle: "italic" }}>
                    Pending Thomas approval
                  </span>
                )}
                {isCompleted && (
                  <span style={{ ...SANS, fontSize: 12, color: T.fgMute }}>
                    Completed {fmtDate(goal.completed_at!)}
                  </span>
                )}
              </div>

              <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: isDimmed ? T.fgDim : T.amber, transition: "color 0.15s ease" }}>
                +{goal.xp}XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Level History Drawer ─────────────────────────────────────────────────────

function LevelHistoryDrawer({
  level, xpCurrent, arrCurrent, events, onClose,
}: {
  level: number;
  xpCurrent: number;
  arrCurrent: number;
  events: LevelEvent[];
  onClose: () => void;
}) {
  const xpNext = xpToNextLevel(arrCurrent);
  const pct = Math.min(100, Math.round((xpCurrent / xpNext) * 100));

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "oklch(0 0 0 / 0.55)" }} onClick={onClose} />
      <aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col w-full sm:w-[340px]"
        style={{ background: T.surfaceLow, borderRight: `1px solid ${T.border}` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex flex-col gap-1">
            <span style={LABEL}>Level History</span>
            <p style={{ ...MONO, fontWeight: 700, fontSize: 20, color: T.amber }}>
              Level {level} · {xpCurrent} XP
            </p>
          </div>
          <button onClick={onClose} style={{ color: T.fgMute, cursor: "pointer", marginTop: 2 }} aria-label="Close">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* XP progress */}
        <div className="px-6 py-4 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex justify-between mb-2" style={{ ...MONO, fontSize: 11, color: T.fgMid }}>
            <span>To Level {level + 1}</span>
            <span>{xpCurrent} / {xpNext} XP</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: T.amber }} />
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <p style={{ ...SANS, fontSize: 13, color: T.fgMute }}>No XP events yet.</p>
              <p style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4 }}>
                Complete goals and attend sessions to earn XP.
              </p>
            </div>
          ) : (
            events.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 px-6 py-4" style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                <span style={{ ...MONO, fontSize: 11, color: T.fgMute, whiteSpace: "nowrap", paddingTop: 2 }}>
                  {fmtDate(entry.created_at)}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p style={{ ...SANS, fontSize: 13, color: T.fg }}>{entry.action}</p>
                  <span style={{ ...MONO, fontSize: 11, color: T.amber }}>
                    +{entry.xp} XP · Level {entry.level_after}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

// ─── ARR History Drawer ───────────────────────────────────────────────────────

function ArrHistoryDrawer({
  arrCurrent, arrTarget, arrPct, history, onClose,
}: {
  arrCurrent: number;
  arrTarget: number;
  arrPct: number;
  history: ArrHistoryEntry[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "oklch(0 0 0 / 0.55)" }} onClick={onClose} />
      <aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col w-full sm:w-[340px]"
        style={{ background: T.surfaceLow, borderRight: `1px solid ${T.border}` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex flex-col gap-1">
            <span style={LABEL}>ARR History</span>
            <p style={{ ...MONO, fontWeight: 700, fontSize: 20, color: T.amber }}>
              {fmtArr(arrCurrent)} → {fmtArr(arrTarget)}
            </p>
          </div>
          <button onClick={onClose} style={{ color: T.fgMute, cursor: "pointer", marginTop: 2 }} aria-label="Close">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex justify-between mb-2" style={{ ...MONO, fontSize: 11, color: T.fgMid }}>
            <span>To next milestone</span>
            <span>{arrPct}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
            <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <p style={{ ...SANS, fontSize: 13, color: T.fgMute }}>No ARR updates yet.</p>
            </div>
          ) : (
            history.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-4 px-6 py-4" style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                <span style={{ ...MONO, fontSize: 11, color: T.fgMute, whiteSpace: "nowrap", paddingTop: 2 }}>
                  {entry.date}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: T.fg }}>{fmtArr(entry.value)}</span>
                  {entry.note && (
                    <p style={{ ...SANS, fontSize: 12, color: T.fgMid, lineHeight: 1.4 }}>{entry.note}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Chat Sidebar ─────────────────────────────────────────────────────────────
// User messages → SANS (human voice)
// Assistant messages → MONO (system voice)

function dbMessagesToUIMessages(dbMessages: Message[]): UIMessage[] {
  return dbMessages.map(m => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));
}

function ChatSidebar({
  chatHistory,
  onClose,
}: {
  chatHistory: Message[];
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    messages: dbMessagesToUIMessages(chatHistory),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "oklch(0 0 0 / 0.4)" }} onClick={onClose} />
      <aside
        className="fixed right-0 top-0 h-full z-50 flex flex-col w-full sm:w-[360px]"
        style={{ background: T.surfaceLow, borderLeft: `1px solid ${T.border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-none" style={{ borderBottom: `1px solid ${T.border}` }}>
          <span style={LABEL}>Chat · Full Context</span>
          <button onClick={onClose} style={{ color: T.fgMute, cursor: "pointer" }} aria-label="Close chat">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 p-5">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  ...MONO,
                  fontSize: 13,
                  lineHeight: 1.55,
                  background: T.surface,
                  color: T.fgMid,
                  border: `1px solid ${T.border}`,
                }}
              >
                I have full context — your ARR, goals, Thomas&apos;s notes. What&apos;s on your mind?
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const text = msg.parts
              .filter(p => p.type === "text")
              .map(p => (p as { type: "text"; text: string }).text)
              .join("");

            if (!text && msg.role === "assistant") {
              // Still streaming first chunk — show typing indicator
              return (
                <div key={msg.id} className="flex justify-start">
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 6,
                      ...MONO,
                      fontSize: 13,
                      background: T.surface,
                      color: T.fgMute,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span className="animate-pulse">···</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 6,
                    ...(msg.role === "user" ? SANS : MONO),
                    fontSize: 13,
                    lineHeight: 1.55,
                    background: msg.role === "user" ? T.amber : T.surface,
                    color: msg.role === "user" ? "oklch(0.12 0 0)" : T.fgMid,
                    border: msg.role === "assistant" ? `1px solid ${T.border}` : "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {/* Typing indicator — shown while waiting for first chunk */}
          {status === "submitted" && (
            <div className="flex justify-start">
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  ...MONO,
                  fontSize: 13,
                  background: T.surface,
                  color: T.fgMute,
                  border: `1px solid ${T.border}`,
                }}
              >
                <span className="animate-pulse">···</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 flex-none" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isStreaming ? "Responding..." : "Ask anything..."}
              disabled={isStreaming}
              style={{
                flex: 1,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "8px 12px",
                ...SANS,
                fontSize: 13,
                color: isStreaming ? T.fgMute : T.fg,
                outline: "none",
                cursor: isStreaming ? "not-allowed" : "text",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              aria-label="Send"
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isStreaming || !input.trim() ? T.border : T.amber,
                border: "none",
                borderRadius: 6,
                cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
                color: "oklch(0.12 0 0)",
                transition: "background 0.15s ease",
              }}
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Mobile Session Log ───────────────────────────────────────────────────────

function MobileSessionLog({ calls }: { calls: Call[] }) {
  const [openCall, setOpenCall] = useState<Call | null>(null);

  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="px-5 pt-4 pb-3">
        <span style={LABEL}>Session Log</span>
      </div>
      {calls.length === 0 ? (
        <p style={{ ...SANS, fontSize: 12, color: T.fgMute, padding: "0 20px 12px" }}>No completed sessions yet.</p>
      ) : (
        calls.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 px-5 py-2.5" style={{ borderBottom: `1px solid ${T.borderSub}` }}>
            <span style={{ ...MONO, fontSize: 12, color: T.fgMid }}>{fmtDate(c.call_date)}</span>
            {c.summary && (
              <p style={{ ...SANS, fontSize: 11, color: T.fgMute, lineHeight: 1.4 }}>{c.summary}</p>
            )}
            {c.raw_text && (
              <button
                onClick={() => setOpenCall(c)}
                style={{
                  ...MONO, fontSize: 10, letterSpacing: "0.06em",
                  background: "transparent", color: T.fgDim,
                  border: "none", padding: 0, cursor: "pointer",
                  textAlign: "left", width: "fit-content",
                }}
              >
                VIEW TRANSCRIPT
              </button>
            )}
          </div>
        ))
      )}
      {openCall && (
        <TranscriptDrawer call={openCall} onClose={() => setOpenCall(null)} />
      )}
    </div>
  );
}

const BOTTOM_TILES_CONFIG: { key: keyof FeaturesEnabled; label: string; teaser: string }[] = [
  { key: "insights",   label: "Insights",   teaser: "Patterns Thomas sees across founders at your stage" },
  { key: "playbooks",  label: "Playbooks",  teaser: "Step-by-step frameworks for your biggest challenges" },
  { key: "community",  label: "Community",  teaser: "Peer founders on the same $0 → $2M path" },
  { key: "peer_calls", label: "Peer Calls", teaser: "Monthly group sessions with other club members" },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface PortalDashboardProps {
  data: PortalData;
  signOut: () => Promise<void>;
}

export function PortalDashboard({ data, signOut }: PortalDashboardProps) {
  const { member, goals, levelEvents, nextCallDate, calls, thomasFeed, featuresEnabled, chatHistory, arrHistory } = data;
  const [showHistory, setShowHistory] = useState(false);
  const [showArrHistory, setShowArrHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const displayName = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;

  const isGraduated = member.arr_current >= 2_000_000;
  const _arrPrevRung = prevArrRung(member.arr_target);
  const arrPct = isGraduated ? 100 : Math.max(0, Math.min(100, Math.round(
    ((member.arr_current - _arrPrevRung) / (member.arr_target - _arrPrevRung)) * 100
  )));

  const nextCallLabel = nextCallDate ? fmtDate(nextCallDate) : "TBD";
  const nextCallDays = nextCallDate ? daysUntil(nextCallDate) : null;

  const thomasFeedUnlocked = thomasFeed.length > 0;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: T.border }}>

      <TopBar name={displayName} role={member.role} onLogout={() => signOut()} />

      {/*
        Desktop grid: 4 cols × 3 rows (hidden below md)
        Row 1 (108px):  Level | ARR (span 2) | Next Call
        Row 2 (1fr):    Goals (span 2) | Thomas Feed | Session Log
        Row 3 (162px):  Insights | Playbooks | Community | Peer Calls
      */}
      <div
        className="hidden md:grid"
        style={{
          flex: 1,
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "108px 1fr 162px",
          gap: 1,
          minHeight: 0,
        }}
      >
        {/* ── ROW 1 ── */}

        {/* Level ring — clickable, opens history */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowHistory(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowHistory(true)}
          className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: T.bg }}
          aria-label="View level history"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, border: `2px solid ${T.amber}`, color: T.amber, ...MONO, fontSize: 24, fontWeight: 700 }}
          >
            {member.level}
          </div>
          <span style={LABEL}>AI-Native Level</span>
        </div>

        {/* ARR — spans cols 2–3, clickable to open history */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowArrHistory(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowArrHistory(true)}
          className="col-span-2 flex flex-col justify-center gap-2 px-7 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: T.bg }}
          aria-label="View ARR history"
        >
          <span style={LABEL}>ARR</span>
          {isGraduated ? (
            <>
              <span style={{ ...MONO, fontSize: 24, fontWeight: 700, color: T.amber }}>$2M</span>
              <span style={{ ...SANS, fontSize: 12, color: T.amber }}>Graduated — welcome to the other side.</span>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span style={{ ...MONO, fontSize: 24, fontWeight: 700, color: T.fg }}>{fmtArr(member.arr_current)}</span>
                <span style={{ ...MONO, color: T.fgMute, fontSize: 16 }}>→</span>
                <span style={{ ...MONO, fontSize: 24, fontWeight: 700, color: T.fg }}>{fmtArr(member.arr_target)}</span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
                <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
              </div>
              <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{arrPct}% to next milestone</span>
            </>
          )}
        </div>

        {/* Next Call */}
        <div className="flex flex-col justify-center gap-1.5 px-7" style={{ background: T.bg }}>
          <span style={LABEL}>Next Call</span>
          <span style={{ ...MONO, fontSize: 24, fontWeight: 700, color: T.amber }}>{nextCallLabel}</span>
          {nextCallDays !== null && nextCallDays > 0 && (
            <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{nextCallDays} days</span>
          )}
          {nextCallDays !== null && nextCallDays <= 0 && (
            <span style={{ ...MONO, fontSize: 11, color: T.amber }}>today</span>
          )}
        </div>

        {/* ── ROW 2 ── */}

        <div className="col-span-2" style={{ overflow: "hidden" }}>
          <GoalsSection goals={goals} />
        </div>

        {thomasFeedUnlocked
          ? <ThomasFeedTile entries={thomasFeed} />
          : <LockedTile label="Thomas Feed" teaser="Personal notes and observations from Thomas after each session" />
        }

        <SessionLogTile calls={calls} />

        {/* ── ROW 3 ── */}

        {BOTTOM_TILES_CONFIG.map(({ key, label, teaser }) => (
          featuresEnabled[key]
            ? (
              <div key={key} className="flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: T.surfaceLow }}>
                <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.fgMid }}>{label}</span>
                <span style={{ ...SANS, fontSize: 12, color: T.fgDim }}>Coming soon</span>
              </div>
            )
            : <LockedTile key={key} label={label} teaser={teaser} />
        ))}
      </div>

      {/* ── Mobile card stack (hidden above md) ── */}
      <div className="md:hidden flex-1 overflow-y-auto" style={{ background: T.bg }}>

        {/* Level + XP — tappable → history */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowHistory(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowHistory(true)}
          className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ borderBottom: `1px solid ${T.border}` }}
          aria-label="View level history"
        >
          <div
            className="flex items-center justify-center rounded-full flex-none"
            style={{ width: 52, height: 52, border: `2px solid ${T.amber}`, color: T.amber, ...MONO, fontSize: 18, fontWeight: 700 }}
          >
            {member.level}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span style={LABEL}>AI-Native Level</span>
            <div className="flex justify-between" style={{ ...MONO, fontSize: 11, color: T.fgMid }}>
              <span>To Level {member.level + 1}</span>
              <span>{member.xp_current} / {xpToNextLevel(member.arr_current)} XP</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((member.xp_current / xpToNextLevel(member.arr_current)) * 100))}%`, background: T.amber }} />
            </div>
          </div>
          <ChevronRight size={14} strokeWidth={1.5} style={{ color: T.fgMute, flexShrink: 0 }} />
        </div>

        {/* ARR */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowArrHistory(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowArrHistory(true)}
          className="px-5 py-4 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ borderBottom: `1px solid ${T.border}` }}
          aria-label="View ARR history"
        >
          <span style={LABEL}>ARR</span>
          {isGraduated ? (
            <>
              <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: T.amber }}>$2M</span>
              <span style={{ ...SANS, fontSize: 12, color: T.amber }}>Graduated — welcome to the other side.</span>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: T.fg }}>{fmtArr(member.arr_current)}</span>
                <span style={{ ...MONO, color: T.fgMute, fontSize: 14 }}>→</span>
                <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: T.fg }}>{fmtArr(member.arr_target)}</span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: T.border }}>
                <div className="h-full rounded-full" style={{ width: `${arrPct}%`, background: T.amber }} />
              </div>
              <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{arrPct}% to next milestone</span>
            </>
          )}
        </div>

        {/* Next Call */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex flex-col gap-1">
            <span style={LABEL}>Next Call</span>
            <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: T.amber }}>{nextCallLabel}</span>
            {nextCallDays !== null && nextCallDays > 0 && (
              <span style={{ ...MONO, fontSize: 11, color: T.fgMute }}>{nextCallDays} days</span>
            )}
            {nextCallDays !== null && nextCallDays <= 0 && (
              <span style={{ ...MONO, fontSize: 11, color: T.amber }}>today</span>
            )}
          </div>
        </div>

        {/* Goals */}
        <div style={{ borderBottom: `1px solid ${T.border}` }}>
          <GoalsSection goals={goals} mobile />
        </div>

        {/* Thomas Feed */}
        {thomasFeedUnlocked ? (
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={LABEL}>Thomas Feed</span>
            <p style={{ ...SANS, fontSize: 13, color: T.fgMid, lineHeight: 1.5, marginTop: 8 }}>
              {thomasFeed[0].note}
            </p>
            <span style={{ ...MONO, fontSize: 10, color: T.fgMute, display: "block", marginTop: 6 }}>
              {fmtDate(thomasFeed[0].created_at)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceLow }}>
            <Lock size={15} strokeWidth={1.5} style={{ color: T.fgMute, flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.fgMute }}>Thomas Feed</span>
              <p style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4, marginTop: 2 }}>Personal notes and observations from Thomas after each session</p>
            </div>
          </div>
        )}

        {/* Session Log */}
        <MobileSessionLog calls={calls} />

        {/* Bottom feature tiles */}
        {BOTTOM_TILES_CONFIG.map(({ key, label, teaser }) => (
          <div
            key={key}
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceLow }}
          >
            {featuresEnabled[key] ? (
              <>
                <div className="flex-1 min-w-0">
                  <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.fgMid }}>{label}</span>
                  <p style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4, marginTop: 2 }}>Coming soon</p>
                </div>
              </>
            ) : (
              <>
                <Lock size={15} strokeWidth={1.5} style={{ color: T.fgMute, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.fgMute }}>{label}</span>
                  <p style={{ ...SANS, fontSize: 12, color: T.fgDim, lineHeight: 1.4, marginTop: 2 }}>{teaser}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chat FAB — 44px tap target */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          aria-label="Open chat"
          className="hover:opacity-75 transition-opacity"
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 30,
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: "50%", cursor: "pointer", color: T.fgMute,
          }}
        >
          <MessageSquare size={16} strokeWidth={1.5} />
        </button>
      )}

      {showHistory && (
        <LevelHistoryDrawer
          level={member.level}
          xpCurrent={member.xp_current}
          arrCurrent={member.arr_current}
          events={levelEvents}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showArrHistory && (
        <ArrHistoryDrawer
          arrCurrent={member.arr_current}
          arrTarget={member.arr_target}
          arrPct={arrPct}
          history={arrHistory}
          onClose={() => setShowArrHistory(false)}
        />
      )}
      {showChat && <ChatSidebar chatHistory={chatHistory} onClose={() => setShowChat(false)} />}
    </div>
  );
}
