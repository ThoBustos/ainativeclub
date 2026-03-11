"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveApplication, rejectApplication } from "@/app/actions/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  building: string;
  arr: string;
  role: string;
  pain_points: string;
  github: string | null;
  linkedin: string | null;
  website: string;
  status: string;
  created_at: string;
};

// ─── Design tokens ────────────────────────────────────────────────────────────

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
  green:      "oklch(0.70 0.15 145)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };
const LABEL: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.fgMute,
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({ app, onAction, disabled }: {
  app: Application;
  onAction: (id: string, action: "approve" | "reject") => void;
  disabled: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-5 p-6"
      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span style={{ ...MONO, fontSize: 15, fontWeight: 700, color: T.fg }}>
            {app.first_name} {app.last_name}
          </span>
          <span style={{ ...SANS, fontSize: 12, color: T.fgMute }}>{app.email}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span style={{ ...MONO, fontSize: 10, color: T.fgDim }}>{fmtDate(app.created_at)}</span>
          <span
            style={{
              ...MONO, fontSize: 9, letterSpacing: "0.1em",
              color: app.status === "pending" ? T.amber : T.fgMute,
              background: app.status === "pending" ? "oklch(0.15 0.08 55)" : T.surfaceLow,
              padding: "1px 6px", borderRadius: 3,
            }}
          >
            {app.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <div>
          <span style={LABEL}>Role</span>
          <p style={{ ...SANS, fontSize: 13, color: T.fgMid, marginTop: 2 }}>{app.role}</p>
        </div>
        <div>
          <span style={LABEL}>Current ARR</span>
          <p style={{ ...MONO, fontSize: 13, color: T.fgMid, marginTop: 2 }}>{app.arr}</p>
        </div>
        <div className="col-span-2">
          <span style={LABEL}>Building</span>
          <p style={{ ...SANS, fontSize: 13, color: T.fgMid, marginTop: 2, lineHeight: 1.5 }}>{app.building}</p>
        </div>
        <div className="col-span-2">
          <span style={LABEL}>Biggest challenge</span>
          <p style={{ ...SANS, fontSize: 13, color: T.fgMid, marginTop: 2, lineHeight: 1.5 }}>{app.pain_points}</p>
        </div>
        <div>
          <span style={LABEL}>Website</span>
          <a
            href={app.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...MONO, fontSize: 12, color: T.amber, marginTop: 2, display: "block" }}
          >
            {app.website.replace(/^https?:\/\//, "")}
          </a>
        </div>
        {(app.github || app.linkedin) && (
          <div>
            <span style={LABEL}>Links</span>
            <div className="flex gap-3 mt-1">
              {app.github && (
                <a href={app.github} target="_blank" rel="noopener noreferrer"
                  style={{ ...MONO, fontSize: 12, color: T.fgMute }}>GitHub</a>
              )}
              {app.linkedin && (
                <a href={app.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{ ...MONO, fontSize: 12, color: T.fgMute }}>LinkedIn</a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(app.status === "pending" || app.status === "reviewing") && (
        <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={() => onAction(app.id, "approve")}
            disabled={disabled}
            style={{
              ...MONO, fontSize: 12, letterSpacing: "0.06em",
              background: disabled ? T.fgDim : T.green,
              color: "oklch(0.10 0 0)",
              border: "none", borderRadius: 5, padding: "8px 18px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            APPROVE
          </button>
          <button
            onClick={() => onAction(app.id, "reject")}
            disabled={disabled}
            style={{
              ...MONO, fontSize: 12, letterSpacing: "0.06em",
              background: "transparent", color: disabled ? T.fgDim : T.red,
              border: `1px solid ${disabled ? T.fgDim : T.red}`,
              borderRadius: 5, padding: "8px 18px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            REJECT
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Applications list ────────────────────────────────────────────────────────

export function ApplicationsList({ initialApps }: { initialApps: Application[] }) {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    startTransition(async () => {
      if (action === "approve") {
        await approveApplication(id);
      } else {
        await rejectApplication(id);
      }
      setApps(prev => prev.filter(a => a.id !== id));
      setProcessingId(null);
      router.refresh();
    });
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span style={LABEL}>Admin</span>
          <h1 style={{ ...MONO, fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 4 }}>
            Applications
          </h1>
        </div>
        <span style={{ ...MONO, fontSize: 12, color: T.fgMute }}>
          {apps.length} pending
        </span>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p style={{ ...SANS, fontSize: 14, color: T.fgMute }}>No pending applications.</p>
        </div>
      ) : (
        <div
          className="flex flex-col gap-4"
          style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s ease" }}
        >
          {apps.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              disabled={processingId !== null}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
